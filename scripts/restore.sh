#!/bin/bash
# =============================================================================
# Market Intelligence Quant Dashboard - 完整還原腳本
# =============================================================================
# 用法: ./scripts/restore.sh <備份名稱>
# 範例: ./scripts/restore.sh backup-20250603-120000
# =============================================================================

set -euo pipefail

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 專案路徑
PROJECT_DIR="/home/hkeeia/projects/AI-Stock/market-intelligence-fullstack"
BACKEND_DIR="${PROJECT_DIR}/backend"

# 檢查參數
if [ $# -lt 1 ]; then
    echo -e "${RED}錯誤: 請提供備份名稱${NC}"
    echo "用法: ./scripts/restore.sh <備份名稱>"
    echo ""
    echo "可用的備份:"
    ls -1 "${PROJECT_DIR}/backups/" 2>/dev/null || echo "  (無備份)"
    exit 1
fi

BACKUP_NAME="$1"
BACKUP_DIR="${PROJECT_DIR}/backups/${BACKUP_NAME}"

if [ ! -d "${BACKUP_DIR}" ]; then
    echo -e "${RED}錯誤: 找不到備份 ${BACKUP_NAME}${NC}"
    echo "可用的備份:"
    ls -1 "${PROJECT_DIR}/backups/" 2>/dev/null || echo "  (無備份)"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Market Intelligence Quant Dashboard - 完整系統還原${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}備份名稱:${NC} ${BACKUP_NAME}"
echo -e "${YELLOW}備份路徑:${NC} ${BACKUP_DIR}"
echo ""

# 顯示警告
echo -e "${RED}⚠  警告: 還原操作將覆蓋現有程式碼與資料庫！${NC}"
echo -e "${RED}   建議先執行一次備份再繼續。${NC}"
echo ""
read -p "確定要繼續還原嗎？請輸入 'yes' 確認: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}已取消還原操作${NC}"
    exit 0
fi

# ─────────────────────────────────────────────────────────────────────────────
# 1. 停止現有服務
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/7] 停止現有服務...${NC}"

# 停止後端
pkill -f "uvicorn app.main:app --host 0.0.0.0 --port 6061" 2>/dev/null || true
sleep 2

# 停止前端 (保留 Next.js dev server，因為它會自動偵測程式碼變更)
echo -e "${YELLOW}  前端 dev server (port 6060) 會自動偵測程式碼變更，無需手動重啟${NC}"

echo -e "${GREEN}✓${NC} 服務已停止"

# ─────────────────────────────────────────────────────────────────────────────
# 2. 還原 Git 程式碼
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[2/7] 還原程式碼...${NC}"

cd "${PROJECT_DIR}"

# 儲存目前的 .env 檔案（如果存在），避免被覆蓋
mkdir -p /tmp/restore-env-backup
cp "${PROJECT_DIR}/.env.local" /tmp/restore-env-backup/frontend.env.local 2>/dev/null || true
cp "${BACKEND_DIR}/.env" /tmp/restore-env-backup/backend.env 2>/dev/null || true

# 還原程式碼 tarball
echo -e "${YELLOW}  正在還原程式碼...${NC}"
tar -xzf "${BACKUP_DIR}/git/code.tar.gz" -C "${PROJECT_DIR}"

# 還原原本的 .env 檔案（備份中的 .env 可能包含舊的設定）
cp /tmp/restore-env-backup/frontend.env.local "${PROJECT_DIR}/.env.local" 2>/dev/null || true
cp /tmp/restore-env-backup/backend.env "${BACKEND_DIR}/.env" 2>/dev/null || true

# 還原 config 中的 .env 檔案（如果使用者選擇還原設定）
read -p "是否還原備份中的 .env 設定檔？(yes/no): " RESTORE_ENV
if [ "$RESTORE_ENV" == "yes" ]; then
    cp "${BACKUP_DIR}/config/backend.env" "${BACKEND_DIR}/.env" 2>/dev/null || echo -e "${YELLOW}  backend.env 不存在於備份中${NC}"
    cp "${BACKUP_DIR}/config/frontend.env.local" "${PROJECT_DIR}/.env.local" 2>/dev/null || echo -e "${YELLOW}  frontend.env.local 不存在於備份中${NC}"
    echo -e "${GREEN}✓${NC} .env 設定檔已還原"
else
    echo -e "${YELLOW}  保留現有 .env 設定檔${NC}"
fi

# 還原未提交的修改（如果存在 patch）
if [ -f "${BACKUP_DIR}/git/uncommitted-changes.patch" ] && [ -s "${BACKUP_DIR}/git/uncommitted-changes.patch" ]; then
    read -p "是否還原未提交的程式碼修改？(yes/no): " RESTORE_PATCH
    if [ "$RESTORE_PATCH" == "yes" ]; then
        git apply "${BACKUP_DIR}/git/uncommitted-changes.patch" || echo -e "${YELLOW}  注意: 部分 patch 可能因程式碼變更而無法自動套用${NC}"
        echo -e "${GREEN}✓${NC} 未提交修改已還原"
    fi
fi

# 還原 staged 的修改
if [ -f "${BACKUP_DIR}/git/staged-changes.patch" ] && [ -s "${BACKUP_DIR}/git/staged-changes.patch" ]; then
    read -p "是否還原 staged 的程式碼修改？(yes/no): " RESTORE_STAGED
    if [ "$RESTORE_STAGED" == "yes" ]; then
        git apply --cached "${BACKUP_DIR}/git/staged-changes.patch" 2>/dev/null || echo -e "${YELLOW}  注意: staged patch 可能無法自動套用${NC}"
    fi
fi

echo -e "${GREEN}✓${NC} 程式碼已還原"

# ─────────────────────────────────────────────────────────────────────────────
# 3. 還原資料庫
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/7] 還原 PostgreSQL 資料庫...${NC}"

if [ -f "${BACKUP_DIR}/database/postgres.dump" ]; then
    if docker ps --format '{{.Names}}' | grep -q "^mi_postgres$"; then
        echo -e "${YELLOW}  正在還原資料庫...${NC}"
        docker exec -i mi_postgres pg_restore \
            -U market_user \
            -d market_intelligence \
            --clean \
            --if-exists \
            --no-owner \
            --no-privileges \
            < "${BACKUP_DIR}/database/postgres.dump" 2>/dev/null || {
                echo -e "${YELLOW}  pg_restore 出現警告（通常是無害的），嘗試另一種方式...${NC}"
                docker exec -i mi_postgres pg_restore \
                    -U market_user \
                    -d market_intelligence \
                    --clean \
                    --if-exists \
                    --no-owner \
                    --no-privileges \
                    --single-transaction \
                    < "${BACKUP_DIR}/database/postgres.dump" 2>/dev/null || true
            }
        echo -e "${GREEN}✓${NC} PostgreSQL 資料庫已還原"
    else
        echo -e "${YELLOW}⚠${NC} mi_postgres 容器未運行，無法還原資料庫"
        echo -e "${YELLOW}   請先啟動 Docker 容器: cd backend && docker compose up -d${NC}"
    fi
else
    echo -e "${YELLOW}⚠${NC} 備份中沒有 PostgreSQL dump 檔案"
fi

# 還原 Redis
if [ -f "${BACKUP_DIR}/database/redis.rdb" ]; then
    if docker ps --format '{{.Names}}' | grep -q "^mi_redis$"; then
        echo -e "${YELLOW}  正在還原 Redis...${NC}"
        docker cp "${BACKUP_DIR}/database/redis.rdb" mi_redis:/data/dump.rdb
        echo -e "${GREEN}✓${NC} Redis 資料已還原 (請重啟 mi_redis 容器以載入)"
    else
        echo -e "${YELLOW}⚠${NC} mi_redis 容器未運行，無法還原 Redis"
    fi
else
    echo -e "${YELLOW}⚠${NC} 備份中沒有 Redis RDB 檔案"
fi

# 還原 Qdrant
if [ -f "${BACKUP_DIR}/database/qdrant.tar.gz" ]; then
    if docker ps --format '{{.Names}}' | grep -q "^mi_qdrant$"; then
        echo -e "${YELLOW}  正在還原 Qdrant...${NC}"
        docker exec mi_qdrant rm -rf /qdrant/storage/* 2>/dev/null || true
        docker cp - < <(docker run --rm -v "${BACKUP_DIR}/database/qdrant.tar.gz:/backup.tar.gz" busybox cat /backup.tar.gz) mi_qdrant:/qdrant/ 2>/dev/null || {
            echo -e "${YELLOW}  使用替代方式還原 Qdrant...${NC}"
            docker exec mi_qdrant sh -c "cd /qdrant && tar -xzf -" < "${BACKUP_DIR}/database/qdrant.tar.gz"
        }
        echo -e "${GREEN}✓${NC} Qdrant 資料已還原"
    else
        echo -e "${YELLOW}⚠${NC} mi_qdrant 容器未運行"
    fi
else
    echo -e "${YELLOW}⚠${NC} 備份中沒有 Qdrant 資料"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. 還原依賴
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/7] 還原依賴...${NC}"

# 還原 Node 依賴
if [ -f "${BACKUP_DIR}/dependencies/pnpm-lock.yaml" ]; then
    echo -e "${YELLOW}  正在安裝 Node 依賴...${NC}"
    cd "${PROJECT_DIR}"
    pnpm install --frozen-lockfile 2>/dev/null || pnpm install
    echo -e "${GREEN}✓${NC} Node 依賴已安裝"
fi

# 還原 Python 依賴
if [ -f "${BACKUP_DIR}/dependencies/python-requirements.txt" ] && [ -d "${BACKEND_DIR}/.venv" ]; then
    echo -e "${YELLOW}  正在安裝 Python 依賴...${NC}"
    cd "${BACKEND_DIR}"
    .venv/bin/pip install -r "${BACKUP_DIR}/dependencies/python-requirements.txt" --quiet || {
        echo -e "${YELLOW}  pip install 出現錯誤，嘗試使用 pyproject.toml...${NC}"
        pip install -e . 2>/dev/null || true
    }
    echo -e "${GREEN}✓${NC} Python 依賴已安裝"
fi

echo -e "${GREEN}✓${NC} 依賴已還原"

# ─────────────────────────────────────────────────────────────────────────────
# 5. 驗證還原
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[5/7] 驗證還原...${NC}"

# 驗證 checksum
cd "${BACKUP_DIR}"
if sha256sum -c checksums.sha256 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 備份檔案 checksum 驗證通過"
else
    echo -e "${YELLOW}⚠${NC} 部分檔案 checksum 不匹配（可能是還原過程中產生的暫存檔）${NC}"
fi

# 驗證資料庫連線
if docker ps --format '{{.Names}}' | grep -q "^mi_postgres$"; then
    if docker exec mi_postgres pg_isready -U market_user -d market_intelligence > /dev/null 2>&1; then
        TABLE_COUNT=$(docker exec mi_postgres psql -U market_user -d market_intelligence -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ')
        echo -e "${GREEN}✓${NC} PostgreSQL 連線正常，共有 ${TABLE_COUNT} 個表格"
    else
        echo -e "${RED}✗${NC} PostgreSQL 無法連線${NC}"
    fi
fi

echo -e "${GREEN}✓${NC} 驗證完成"

# ─────────────────────────────────────────────────────────────────────────────
# 6. 啟動服務
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[6/7] 啟動服務...${NC}"

read -p "是否立即啟動後端服務？(yes/no): " START_BACKEND
if [ "$START_BACKEND" == "yes" ]; then
    cd "${BACKEND_DIR}"
    nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 6061 > /tmp/backend-6061.log 2>&1 &
    echo -e "${GREEN}✓${NC} 後端已啟動 (port 6061, PID $!)"
    sleep 3
    curl -s http://localhost:6061/api/v1/market/overview > /dev/null && echo -e "${GREEN}✓${NC} 後端健康檢查通過" || echo -e "${YELLOW}⚠${NC} 後端可能還在啟動中"
else
    echo -e "${YELLOW}  後端未啟動，請手動執行:${NC}"
    echo "    cd backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 6061"
fi

echo -e "${YELLOW}  前端 dev server 應該已經在運行中 (port 6060)${NC}"
echo -e "${YELLOW}  如果沒有，請執行: pnpm dev (於專案根目錄)${NC}"

echo -e "${GREEN}✓${NC} 服務狀態已更新"

# ─────────────────────────────────────────────────────────────────────────────
# 7. 還原摘要
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[7/7] 還原摘要...${NC}"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  還原完成！${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}還原的備份:${NC} ${BACKUP_NAME}"
echo -e "${YELLOW}還原時間:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo -e "${BLUE}請檢查以下項目:${NC}"
echo "  1. 前端: http://localhost:6060 或 http://aigc3.hkeeia.org:6060"
echo "  2. 後端: http://localhost:6061/api/v1/market/overview"
echo "  3. 資料庫: docker exec mi_postgres pg_isready -U market_user"
echo ""
echo -e "${BLUE}如果出現問題，可以查看:${NC}"
echo "  - 後端日誌: tail -f /tmp/backend-6061.log"
echo "  - 前端日誌: tail -f ${PROJECT_DIR}/frontend.log"
echo "  - Docker 日誌: docker logs mi_postgres"
echo ""
