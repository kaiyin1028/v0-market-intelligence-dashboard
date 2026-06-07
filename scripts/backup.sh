#!/bin/bash
# =============================================================================
# Market Intelligence Quant Dashboard - 完整備份腳本
# =============================================================================
# 用法: ./scripts/backup.sh [備份名稱]
# 如果沒有提供名稱，會自動使用時間戳記
# =============================================================================

set -euo pipefail

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 專案路徑
PROJECT_DIR="/home/hkeeia/projects/AI-Stock/market-intelligence-fullstack"
BACKEND_DIR="${PROJECT_DIR}/backend"

# 備份名稱與路徑
BACKUP_NAME="${1:-backup-$(date +%Y%m%d-%H%M%S)}"
BACKUP_DIR="${PROJECT_DIR}/backups/${BACKUP_NAME}"

# 建立備份目錄
mkdir -p "${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}/database"
mkdir -p "${BACKUP_DIR}/git"
mkdir -p "${BACKUP_DIR}/config"
mkdir -p "${BACKUP_DIR}/dependencies"
mkdir -p "${BACKUP_DIR}/docker"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Market Intelligence Quant Dashboard - 完整系統備份${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}備份名稱:${NC} ${BACKUP_NAME}"
echo -e "${YELLOW}備份路徑:${NC} ${BACKUP_DIR}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 1. 備份 Git 程式碼狀態（包含未提交的修改）
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/8] 備份 Git 程式碼狀態...${NC}"
cd "${PROJECT_DIR}"

# 儲存當前分支與 commit hash
git rev-parse --abbrev-ref HEAD > "${BACKUP_DIR}/git/branch.txt"
git rev-parse HEAD > "${BACKUP_DIR}/git/commit.txt"
git log --oneline -5 > "${BACKUP_DIR}/git/recent-commits.txt"

# 建立包含未提交修改的 patch
git diff --stat > "${BACKUP_DIR}/git/uncommitted-stats.txt"
git diff > "${BACKUP_DIR}/git/uncommitted-changes.patch"
git diff --cached > "${BACKUP_DIR}/git/staged-changes.patch" 2>/dev/null || true

# 備份 untracked 檔案清單
git ls-files --others --exclude-standard > "${BACKUP_DIR}/git/untracked-files.txt"

# 建立完整程式碼 tarball（排除 node_modules 和 .venv）
tar -czf "${BACKUP_DIR}/git/code.tar.gz" \
  --exclude='node_modules' \
  --exclude='.venv' \
  --exclude='.next' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='backups' \
  --exclude='*.log' \
  -C "${PROJECT_DIR}" .

echo -e "${GREEN}✓${NC} Git 狀態已備份"

# ─────────────────────────────────────────────────────────────────────────────
# 2. 備份資料庫 (PostgreSQL)
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[2/8] 備份 PostgreSQL 資料庫...${NC}"

if docker ps --format '{{.Names}}' | grep -q "^mi_postgres$"; then
    docker exec mi_postgres pg_dump \
        -U market_user \
        -d market_intelligence \
        --format=custom \
        --file=/tmp/market_intelligence.dump

    docker cp mi_postgres:/tmp/market_intelligence.dump "${BACKUP_DIR}/database/postgres.dump"
    docker exec mi_postgres rm /tmp/market_intelligence.dump

    echo -e "${GREEN}✓${NC} PostgreSQL 資料庫已備份 (mi_postgres)"
else
    echo -e "${YELLOW}⚠${NC} mi_postgres 容器未運行，跳過資料庫備份"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. 備份 Redis 資料
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/8] 備份 Redis 資料...${NC}"

if docker ps --format '{{.Names}}' | grep -q "^mi_redis$"; then
    docker exec mi_redis redis-cli BGSAVE
    sleep 2
    docker cp mi_redis:/data/dump.rdb "${BACKUP_DIR}/database/redis.rdb"
    echo -e "${GREEN}✓${NC} Redis 資料已備份 (mi_redis)"
else
    echo -e "${YELLOW}⚠${NC} mi_redis 容器未運行，跳過 Redis 備份"
    # 嘗試備份共享的 redis
    if docker ps --format '{{.Names}}' | grep -q "redis"; then
        SHARED_REDIS=$(docker ps --format '{{.Names}}' | grep redis | head -1)
        echo -e "${YELLOW}  注意: 發現其他 Redis 容器 ${SHARED_REDIS}${NC}"
    fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. 備份 Qdrant 資料（如運行中）
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/8] 備份 Qdrant 向量資料庫...${NC}"

if docker ps --format '{{.Names}}' | grep -q "^mi_qdrant$"; then
    docker exec mi_qdrant tar -czf /tmp/qdrant-backup.tar.gz -C /qdrant storage
    docker cp mi_qdrant:/tmp/qdrant-backup.tar.gz "${BACKUP_DIR}/database/qdrant.tar.gz"
    docker exec mi_qdrant rm /tmp/qdrant-backup.tar.gz
    echo -e "${GREEN}✓${NC} Qdrant 資料已備份"
else
    echo -e "${YELLOW}⚠${NC} mi_qdrant 容器未運行，跳過 Qdrant 備份"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. 備份設定檔（含敏感資訊）
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[5/8] 備份設定檔...${NC}"

cp "${BACKEND_DIR}/.env" "${BACKUP_DIR}/config/backend.env" 2>/dev/null || echo -e "${YELLOW}⚠${NC} backend/.env 不存在"
cp "${PROJECT_DIR}/.env.local" "${BACKUP_DIR}/config/frontend.env.local" 2>/dev/null || echo -e "${YELLOW}⚠${NC} .env.local 不存在"
cp "${PROJECT_DIR}/next.config.mjs" "${BACKUP_DIR}/config/next.config.mjs"
cp "${PROJECT_DIR}/package.json" "${BACKUP_DIR}/config/package.json"
cp "${BACKEND_DIR}/pyproject.toml" "${BACKUP_DIR}/config/pyproject.toml"
cp "${BACKEND_DIR}/alembic.ini" "${BACKUP_DIR}/config/alembic.ini" 2>/dev/null || true
cp "${PROJECT_DIR}/tsconfig.json" "${BACKUP_DIR}/config/tsconfig.json"

echo -e "${GREEN}✓${NC} 設定檔已備份"

# ─────────────────────────────────────────────────────────────────────────────
# 6. 備份依賴清單
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[6/8] 備份依賴清單...${NC}"

cp "${PROJECT_DIR}/pnpm-lock.yaml" "${BACKUP_DIR}/dependencies/pnpm-lock.yaml"

# Python 虛擬環境套件清單
cd "${BACKEND_DIR}"
if [ -d ".venv" ]; then
    .venv/bin/pip freeze > "${BACKUP_DIR}/dependencies/python-requirements.txt"
    echo -e "${GREEN}✓${NC} Python 套件清單已匯出"
else
    echo -e "${YELLOW}⚠${NC} Python 虛擬環境不存在"
fi

# Node 版本
node --version > "${BACKUP_DIR}/dependencies/node-version.txt" 2>/dev/null || true
python3 --version > "${BACKUP_DIR}/dependencies/python-version.txt" 2>/dev/null || true

echo -e "${GREEN}✓${NC} 依賴清單已備份"

# ─────────────────────────────────────────────────────────────────────────────
# 7. 備份運行中服務狀態
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[7/8] 記錄運行中服務狀態...${NC}"

# 記錄 Docker 容器狀態
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}" > "${BACKUP_DIR}/docker/running-containers.txt"

# 記錄後端程序
ps aux | grep -E "(uvicorn|python.*app\.main)" | grep -v grep > "${BACKUP_DIR}/docker/backend-processes.txt" || true

# 記錄前端程序
ps aux | grep -E "(next dev|turbopack)" | grep -v grep > "${BACKUP_DIR}/docker/frontend-processes.txt" || true

# 記錄端口使用情況
ss -tlnp | grep -E "(6060|6061|5433|6379|6333)" > "${BACKUP_DIR}/docker/port-usage.txt" 2>/dev/null || true

echo -e "${GREEN}✓${NC} 服務狀態已記錄"

# ─────────────────────────────────────────────────────────────────────────────
# 8. 建立備份摘要與校驗
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[8/8] 建立備份摘要與校驗...${NC}"

# 計算所有檔案的 checksum
cd "${BACKUP_DIR}"
find . -type f -exec sha256sum {} \; > "${BACKUP_DIR}/checksums.sha256"

# 建立備份摘要
cat > "${BACKUP_DIR}/BACKUP-INFO.txt" << EOF
=============================================================================
Market Intelligence Quant Dashboard - 備份資訊
=============================================================================
備份名稱: ${BACKUP_NAME}
備份時間: $(date '+%Y-%m-%d %H:%M:%S')
備份主機: $(hostname)

系統組件:
- 前端: Next.js 16 (port 6060)
- 後端: FastAPI + Uvicorn (port 6061)
- 資料庫: PostgreSQL (port 5433, container: mi_postgres)
- 快取: Redis (port 6379)
- 向量庫: Qdrant (port 6333)

備份內容:
1. git/         - 完整程式碼 tarball + Git 狀態 + 未提交修改 patch
2. database/    - PostgreSQL dump, Redis RDB, Qdrant 資料
3. config/      - .env, pyproject.toml, package.json, tsconfig.json
4. dependencies/ - pnpm-lock.yaml, python-requirements.txt
5. docker/      - 容器狀態、程序清單、端口使用記錄

檔案校驗: checksums.sha256
=============================================================================
EOF

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  備份完成！${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}備份位置:${NC} ${BACKUP_DIR}"
echo -e "${YELLOW}備份大小:${NC} $(du -sh "${BACKUP_DIR}" | cut -f1)"
echo ""
echo -e "${BLUE}備份內容摘要:${NC}"
echo "  $(find "${BACKUP_DIR}" -type f | wc -l) 個檔案"
echo "  $(find "${BACKUP_DIR}/git" -type f | wc -l) Git 相關檔案"
echo "  $(find "${BACKUP_DIR}/database" -type f | wc -l) 資料庫檔案"
echo "  $(find "${BACKUP_DIR}/config" -type f | wc -l) 設定檔"
echo ""
echo -e "${YELLOW}還原指令:${NC}"
echo "  ./scripts/restore.sh ${BACKUP_NAME}"
echo ""
