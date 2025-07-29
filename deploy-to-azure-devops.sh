#!/bin/bash

# Azure DevOps Deployment Script for MonarchSideNavSearchToggler
# This script builds, packages, and deploys the SPFx solution to Azure DevOps

set -e  # Exit on any error

# Configuration
AZURE_DEVOPS_URL="https://monarch360@dev.azure.com/monarch360/Monarch360/_git/MonarchSideNavSearchToggler"
AZURE_DEVOPS_USERNAME="Records.Manager"
AZURE_DEVOPS_PASSWORD="58PRdPuFdJeVY5GjMuPwvQfpjXMqrXqcdgMbGnU76XcilyAeLkXAJQQJ99BGACAAAAAtrfB1AAASAZDO2JXw"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
check_directory() {
    log_info "Checking project directory..."
    if [ ! -f "package.json" ] || [ ! -f "gulpfile.js" ]; then
        log_error "This doesn't appear to be a SPFx project directory. Please run this script from the project root."
        exit 1
    fi
    log_success "Project directory confirmed"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check gulp
    if ! command -v gulp &> /dev/null; then
        log_warning "gulp is not installed globally. Installing..."
        npm install -g gulp-cli
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        log_error "git is not installed. Please install git first."
        exit 1
    fi
    
    log_success "All prerequisites are satisfied"
}

# Install dependencies
install_dependencies() {
    log_info "Installing npm dependencies..."
    npm ci
    log_success "Dependencies installed successfully"
}

# Build the project
build_project() {
    log_info "Building SPFx project..."
    
    # Clean previous builds
    log_info "Cleaning previous builds..."
    gulp clean
    
    # Build for production
    log_info "Building for production..."
    gulp build --ship
    
    # Bundle for production
    log_info "Bundling for production..."
    gulp bundle --ship
    
    # Package solution
    log_info "Packaging solution..."
    gulp package-solution --ship
    
    log_success "Build completed successfully"
}

# Check if package was created
check_package() {
    log_info "Checking for generated package..."
    if [ ! -f "sharepoint/solution/monarch-sidenav.sppkg" ]; then
        log_error "Package file not found. Build may have failed."
        exit 1
    fi
    
    PACKAGE_SIZE=$(ls -lh sharepoint/solution/monarch-sidenav.sppkg | awk '{print $5}')
    log_success "Package found: sharepoint/solution/monarch-sidenav.sppkg ($PACKAGE_SIZE)"
}

# Configure git for Azure DevOps
setup_git() {
    log_info "Setting up git for Azure DevOps..."
    
    # Check if remote already exists
    if git remote get-url azure-devops &> /dev/null; then
        log_info "Azure DevOps remote already exists, updating..."
        git remote set-url azure-devops "$AZURE_DEVOPS_URL"
    else
        log_info "Adding Azure DevOps remote..."
        git remote add azure-devops "$AZURE_DEVOPS_URL"
    fi
    
    # Configure git credentials
    git config credential.helper store
    log_success "Git configured for Azure DevOps"
}

# Stage and commit changes
commit_changes() {
    log_info "Staging and committing changes..."
    
    # Add all changes
    git add .
    
    # Check if there are changes to commit
    if git diff --cached --quiet; then
        log_warning "No changes to commit"
        return 0
    fi
    
    # Create commit message with timestamp
    COMMIT_MESSAGE="Deploy SPFx solution - $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Commit changes
    git commit -m "$COMMIT_MESSAGE"
    log_success "Changes committed: $COMMIT_MESSAGE"
}

# Push to Azure DevOps
push_to_azure_devops() {
    log_info "Pushing to Azure DevOps..."
    
    # Create credential URL with username and password
    CREDENTIAL_URL="https://$AZURE_DEVOPS_USERNAME:$AZURE_DEVOPS_PASSWORD@dev.azure.com/monarch360/Monarch360/_git/MonarchSideNavSearchToggler"
    
    # Push to Azure DevOps
    if git push azure-devops master; then
        log_success "Successfully pushed to Azure DevOps"
    else
        log_error "Failed to push to Azure DevOps"
        log_info "Trying with explicit credentials..."
        
        # Try with explicit credentials
        if git push "$CREDENTIAL_URL" master; then
            log_success "Successfully pushed to Azure DevOps with explicit credentials"
        else
            log_error "Failed to push even with explicit credentials"
            exit 1
        fi
    fi
}

# Create deployment tag
create_deployment_tag() {
    log_info "Creating deployment tag..."
    
    # Get current version from package-solution.json
    VERSION=$(node -p "require('./config/package-solution.json').solution.version")
    TAG_NAME="v$VERSION-deploy-$(date '+%Y%m%d-%H%M%S')"
    
    # Create and push tag
    git tag "$TAG_NAME"
    git push azure-devops "$TAG_NAME"
    
    log_success "Deployment tag created: $TAG_NAME"
}

# Main deployment function
main() {
    echo "🚀 Starting Azure DevOps push for MonarchSideNavSearchToggler"
    echo "============================================================="
    
    # Run only git operations
    setup_git
    commit_changes
    push_to_azure_devops
    create_deployment_tag
    
    echo ""
    echo "🎉 Push completed successfully!"
    echo "🔗 Repository: $AZURE_DEVOPS_URL"
    echo ""
    echo "Next steps:"
    echo "1. Go to Azure DevOps to verify the changes"
    echo "2. Run the Excel to JSON pipeline if needed"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Azure DevOps Deployment Script for MonarchSideNavSearchToggler"
        echo ""
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --build-only   Only build the project, don't push"
        echo "  --push-only    Only push existing changes, don't build"
        echo ""
        echo "Examples:"
        echo "  $0              # Full deployment (build + push)"
        echo "  $0 --build-only # Only build the project"
        echo "  $0 --push-only  # Only push existing changes"
        exit 0
        ;;
    --build-only)
        echo "🔨 Building project only..."
        check_directory
        check_prerequisites
        install_dependencies
        build_project
        check_package
        log_success "Build completed successfully"
        exit 0
        ;;
    --push-only)
        echo "📤 Pushing changes only..."
        setup_git
        commit_changes
        push_to_azure_devops
        create_deployment_tag
        log_success "Push completed successfully"
        exit 0
        ;;
    "")
        # No arguments, run full deployment
        main
        ;;
    *)
        log_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac 