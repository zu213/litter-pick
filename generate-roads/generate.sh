#!/bin/bash
set -e

usage() {
  echo "Usage: ./generate.sh <south> <west> <north> <east> [output.geojson]"
  echo "  Example: ./generate.sh 51.748 -0.606 51.780 -0.530"
  echo "  Example: ./generate.sh 51.748 -0.606 51.780 -0.530 my-area.geojson"
  exit 1
}

if [ "$#" -lt 4 ]; then
  usage
fi

S=$1
W=$2
N=$3
E=$4
OUTPUT=${5:-roads.geojson}

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

python3 "$SCRIPT_DIR/generateRoads.py" "$S" "$W" "$N" "$E" "$OUTPUT"
