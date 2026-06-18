#!/bin/bash

# Wing & Weft — Banner & Category Storage Cleanup Script
# Deletes 42 confirmed orphaned files from banner-images and category-images buckets
# Safe to run: these files are NOT referenced by any active banner or category
#
# Usage: bash cleanup_banners_categories.sh YOUR_SERVICE_ROLE_KEY

SUPABASE_URL="https://gtbzzrdkvugttgcwrvrm.supabase.co"
SERVICE_ROLE_KEY="${1}"

if [ -z "$SERVICE_ROLE_KEY" ]; then
  echo "ERROR: Please provide your service role key as argument"
  echo "Usage: bash cleanup_banners_categories.sh eyJhbG..."
  exit 1
fi

TOTAL_SUCCESS=0
TOTAL_FAILED=0

# ─── Helper function ──────────────────────────────────────────────────────────
delete_file() {
  local BUCKET="$1"
  local FILE="$2"
  local INDEX="$3"
  local TOTAL="$4"

  BODY=$(printf '{"prefixes":["%s"]}' "$FILE")

  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
    "${SUPABASE_URL}/storage/v1/object/${BUCKET}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "$BODY")

  if [ "$RESPONSE" = "200" ]; then
    TOTAL_SUCCESS=$((TOTAL_SUCCESS + 1))
    echo "✓ [$INDEX/$TOTAL] Deleted from $BUCKET: $FILE"
  else
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
    echo "✗ FAILED ($RESPONSE) from $BUCKET: $FILE"
  fi

  sleep 0.1
}

# ─── Banner Images ────────────────────────────────────────────────────────────
BANNER_FILES=(
  "banners/8744a8fa-7650-4358-a030-e78e31cd748e_1772639907959.png"
  "banners/8744a8fa-7650-4358-a030-e78e31cd748e_1772644667187.jpg"
  "banners/8744a8fa-7650-4358-a030-e78e31cd748e_1772816635684.jpg"
  "banners/8744a8fa-7650-4358-a030-e78e31cd748e_1772817483751.webp"
  "banners/8744a8fa-7650-4358-a030-e78e31cd748e_1775386104354.jpg"
  "banners/8744a8fa-7650-4358-a030-e78e31cd748e_1776005767449.jpeg"
  "banners/8744a8fa-7650-4358-a030-e78e31cd748e_1776447950888.jpg"
  "banners/8744a8fa-7650-4358-a030-e78e31cd748e_1776448352387.jpg"
  "banners/8744a8fa-7650-4358-a030-e78e31cd748e_1776448523688.jpg"
  "banners/d1446454-ba11-4d73-b79c-5c4fd5517f0c_1772816488162.jpg"
  "banners/d1446454-ba11-4d73-b79c-5c4fd5517f0c_1772896182424.jpg"
  "banners/d1446454-ba11-4d73-b79c-5c4fd5517f0c_1773467423963.jpg"
  "banners/d1446454-ba11-4d73-b79c-5c4fd5517f0c_1773468081440.jpg"
  "banners/d1446454-ba11-4d73-b79c-5c4fd5517f0c_1773468442236.jpg"
  "banners/d1446454-ba11-4d73-b79c-5c4fd5517f0c_1775386223913.jpg"
  "banners/d1446454-ba11-4d73-b79c-5c4fd5517f0c_1776005757538.jpeg"
  "banners/d1446454-ba11-4d73-b79c-5c4fd5517f0c.jpeg"
  "banners/e6a12b1a-219c-4aa0-b961-ad31eca35eec_1772816358567.jpg"
  "banners/e6a12b1a-219c-4aa0-b961-ad31eca35eec_1772817450037.webp"
  "banners/e6a12b1a-219c-4aa0-b961-ad31eca35eec_1775386251341.jpg"
  "banners/e6a12b1a-219c-4aa0-b961-ad31eca35eec_1776005763310.jpeg"
)

# ─── Category Images ──────────────────────────────────────────────────────────
CATEGORY_FILES=(
  "categories/cotton-sarees_1772816704720.jpg"
  "categories/cotton-sarees_1776252349780.jpg"
  "categories/cotton-sarees_1779014681876.webp"
  "categories/georgette-sarees_1776252372066.jpg"
  "categories/georgette-sarees_1779014701574.webp"
  "categories/kalamkari-sarees_1778609802170.jpg"
  "categories/kalamkari-sarees_1779015600052.webp"
  "categories/kerala-sarees_1775122114906.jpg"
  "categories/kerala-sarees_1776252318081.jpg"
  "categories/kerala-sarees_1777742482874.jpg"
  "categories/kerala-sarees_1779014663107.webp"
  "categories/linen-sarees_1772816730744.jpg"
  "categories/linen-sarees_1776252394878.jpg"
  "categories/linen-sarees_1779014719203.webp"
  "categories/silk-sarees_1772816687163.jpg"
  "categories/silk-sarees_1776252227992.jpg"
  "categories/silk-sarees_1777742469752.jpg"
  "categories/silk-sarees_1777742523901.jpg"
  "categories/silk-sarees_1777743924479.jpg"
  "categories/silk-sarees_1779014641168.webp"
  "categories/test-5_1774690906592.jpg"
)

TOTAL=$((${#BANNER_FILES[@]} + ${#CATEGORY_FILES[@]}))
INDEX=0

echo "========================================"
echo "Wing & Weft — Banner & Category Cleanup"
echo "Deleting $TOTAL orphaned files total"
echo "  • ${#BANNER_FILES[@]} from banner-images"
echo "  • ${#CATEGORY_FILES[@]} from category-images"
echo "========================================"
echo ""

echo "--- banner-images ---"
for FILE in "${BANNER_FILES[@]}"; do
  INDEX=$((INDEX + 1))
  delete_file "banner-images" "$FILE" "$INDEX" "$TOTAL"
done

echo ""
echo "--- category-images ---"
for FILE in "${CATEGORY_FILES[@]}"; do
  INDEX=$((INDEX + 1))
  delete_file "category-images" "$FILE" "$INDEX" "$TOTAL"
done

echo ""
echo "========================================"
echo "Done! Deleted: $TOTAL_SUCCESS | Failed: $TOTAL_FAILED"
echo "========================================"
