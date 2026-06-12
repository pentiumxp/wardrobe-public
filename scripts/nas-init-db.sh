#!/bin/sh
set -eu

DOCKER="/var/packages/ContainerManager/target/usr/bin/docker"
APP_DIR="/volume1/Wardrobe/wardrobe-app"
CONTAINER="wardrobe-app"

$DOCKER cp "$APP_DIR/wardrobe_app/db.py" "$CONTAINER:/app/wardrobe_app/db.py"
$DOCKER exec "$CONTAINER" python -c "from wardrobe_app.db import connect, init_db; conn = connect(); init_db(conn); conn.close(); print('DB_INIT_OK')"
$DOCKER restart "$CONTAINER"
