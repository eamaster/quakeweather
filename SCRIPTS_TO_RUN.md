# 🧹 Git History Scrubbing - Step-by-Step Guide

⚠️ **IMPORTANT**: These scripts will rewrite git history. Only run these if you have confirmed secrets were committed to the repository.

## ⚠️ Before You Begin

1. **Backup your repository**: Create a full backup before proceeding
2. **Notify collaborators**: All collaborators will need to re-clone the repository
3. **Rotate compromised keys**: Rotate all exposed API keys BEFORE scrubbing history
4. **Document the secrets**: Note which secrets were exposed for rotation tracking

## 🎯 Option 1: Using git-filter-repo (Recommended)

### Prerequisites
```bash
# Install git-filter-repo
pip install git-filter-repo

# Or on macOS
brew install git-filter-repo
```

### Step 1: Remove Secrets from History

Replace `SECRET_VALUE` with the actual secret value to remove:

```bash
# Remove OpenWeather API key (replace with actual exposed key)
git filter-repo --replace-text <(echo "REMOVED_OPENWEATHER_API_KEY==>REMOVED_SECRET")

# Remove Mapbox token (replace with actual exposed token)
git filter-repo --replace-text <(echo "REMOVED_MAPBOX_TOKEN==>REMOVED_SECRET")

# Remove Cohere API key (replace with actual exposed key)
git filter-repo --replace-text <(echo "REMOVED_COHERE_API_KEY==>REMOVED_SECRET")

# Remove any other exposed secrets
git filter-repo --replace-text <(echo "YOUR_SECRET_HERE==>REMOVED_SECRET")
```

### Step 2: Create Replacement File (Alternative Method)

Create a file `replacements.txt`:
```
REMOVED_OPENWEATHER_API_KEY==>your_openweather_api_key_here
REMOVED_MAPBOX_TOKEN==>your_mapbox_public_token_here
REMOVED_COHERE_API_KEY==>your_cohere_api_key_here
REMOVED_OPENWEATHER_API_KEY==>your_openweather_api_key_here
```

Then run:
```bash
git filter-repo --replace-text replacements.txt
```

### Step 3: Force Push (Destructive!)

⚠️ **WARNING**: This will overwrite remote history. All collaborators must re-clone.

```bash
# Verify the changes first
git log --all --full-history -- source_file

# Force push to remote (REQUIRES FORCE PUSH PERMISSION)
git push origin --force --all
git push origin --force --tags
```

## 🎯 Option 2: Using BFG Repo-Cleaner

### Prerequisites
```bash
# Download BFG (Java required)
# https://rtyley.github.io/bfg-repo-cleaner/

# Or via Homebrew (macOS)
brew install bfg
```

### Step 1: Create Passwords File

Create `secrets.txt` with one secret per line:
```
REMOVED_OPENWEATHER_API_KEY
REMOVED_MAPBOX_TOKEN
REMOVED_COHERE_API_KEY
REMOVED_OPENWEATHER_API_KEY
```

### Step 2: Clone Fresh Repository
```bash
# Create a fresh clone (bare repository)
git clone --mirror https://github.com/eamaster/quakeweather.git quakeweather.git
cd quakeweather.git
```

### Step 3: Run BFG
```bash
# Replace secrets with placeholder
bfg --replace-text ../secrets.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 4: Push Changes
```bash
# Force push (REQUIRES FORCE PUSH PERMISSION)
git push --force
```

## 🎯 Option 3: Manual File-by-File (For Specific Files)

If you know exactly which files contain secrets:

```bash
# Remove specific file from all commits
git filter-repo --path path/to/file --invert-paths

# Or replace content in specific file
git filter-repo --path path/to/file --replace-text replacements.txt
```

## ✅ Post-Scrubbing Steps

### 1. Verify Secrets Are Removed
```bash
# Search git history for secrets
git log --all --full-history -p | grep -i "REMOVED_OPENWEATHER_API_KEY"
git log --all --full-history -p | grep -i "pk.eyJ1IjoiZWFtYXN0ZXIi"

# Should return no results
```

### 2. Update All Collaborators
Notify all team members to:
```bash
# Delete local repository
rm -rf quakeweather

# Clone fresh
git clone https://github.com/eamaster/quakeweather.git
cd quakeweather
```

### 3. Update Remote References
If using multiple remotes:
```bash
# Update all remotes
git remote set-url origin https://github.com/eamaster/quakeweather.git
git fetch origin
git reset --hard origin/main
```

### 4. Verify Environment Variables
Ensure all secrets are now in environment variables:
- Check `.env.example` has placeholders
- Verify `.dev.vars` is in `.gitignore`
- Confirm Cloudflare environment variables are set
- Test application still works with new keys

### 5. Update Documentation
- Review all documentation files
- Ensure no secrets remain in markdown files
- Update examples to use placeholders
- Add links to key management pages

## 🔍 Finding Exposed Secrets

Before scrubbing, identify all exposed secrets:

```bash
# Search for API keys in git history
git log --all --full-history -p | grep -E "(api[_-]?key|apikey|API[_-]?KEY)" -i
git log --all --full-history -p | grep -E "(token|TOKEN)" -i
git log --all --full-history -p | grep -E "(secret|SECRET)" -i

# Search for specific patterns
git log --all --full-history -p | grep -E "pk\\.ey"
git log --all --full-history -p | grep -E "[0-9a-f]{32}"
```

## ⚠️ Important Warnings

1. **This is destructive**: Git history will be permanently rewritten
2. **Collaborators affected**: Everyone must re-clone the repository
3. **Backup first**: Always create a backup before running these scripts
4. **Rotate keys first**: Never scrub history before rotating exposed keys
5. **Test locally**: Test the scrubbing on a copy of the repository first
6. **Force push required**: You'll need force push permissions on the remote

## 🚨 If Something Goes Wrong

### Restore from Backup
```bash
# If you have a backup, restore it
git remote set-url origin backup_url
git fetch origin
git reset --hard origin/main
```

### Revert Filter-Repo Changes
```bash
# git-filter-repo creates a backup in .git/filter-repo/backup-refs
# Restore from backup if needed
```

## 📚 Additional Resources

- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [GitHub: Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Git: Rewriting History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)

## ✅ Checklist

Before running scrubbing scripts:
- [ ] Backup repository created
- [ ] All exposed keys rotated
- [ ] Collaborators notified
- [ ] Tested on repository copy
- [ ] Replacement values prepared
- [ ] Force push permissions confirmed

After scrubbing:
- [ ] Verified secrets removed from history
- [ ] All collaborators notified to re-clone
- [ ] Environment variables updated
- [ ] Application tested with new keys
- [ ] Documentation updated
- [ ] Secret scanning enabled

---

**Last Updated**: 2025-01-XX  
**Use with caution**: These operations are irreversible

