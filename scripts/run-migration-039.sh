#!/bin/bash
# Run Migration 039 - Creates GIS Tables
# This script connects to production DB and creates 8 spatial tables

set -e  # Exit on error

echo "🌍 Running Migration 039: GIS Infrastructure"
echo "================================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not set"
    echo ""
    echo "To set it, run:"
    echo "  export DATABASE_URL='postgresql://user:pass@host/db'"
    echo ""
    echo "Or get it from Vercel:"
    echo "  vercel env pull"
    echo "  source .env"
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ ERROR: psql not found"
    echo "Install PostgreSQL client:"
    echo "  brew install postgresql  # macOS"
    echo "  apt-get install postgresql-client  # Ubuntu"
    exit 1
fi

echo "✅ psql found"
echo ""

# Run the migration
echo "📊 Executing migration..."
psql "$DATABASE_URL" -f backend/src/migrations/039_geospatial_infrastructure_core.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS: GIS tables created!"
    echo ""
    echo "Created tables:"
    echo "  - transmission_lines"
    echo "  - transmission_structures"
    echo "  - survey_control_points"
    echo "  - right_of_way_boundaries"
    echo "  - site_boundaries"
    echo "  - underground_utilities"
    echo "  - imported_gis_layers"
    echo "  - project_coordinate_systems"
    echo ""
    echo "🎯 Next step: Install GDAL for file import"
else
    echo ""
    echo "❌ FAILED: Migration error"
    echo "Check error messages above"
    exit 1
fi

