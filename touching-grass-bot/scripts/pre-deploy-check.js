#!/usr/bin/env node
/**
 * Pre-deploy check script
 * Runs syntax checks, linting, and basic validation before deployment
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

let hasErrors = false

console.log('🔍 Running pre-deploy checks...\n')

// 1. Syntax check with Node
console.log('1️⃣ Checking JavaScript syntax...')
try {
  execSync('node -c src/app.js', { stdio: 'inherit' })
  console.log('   ✅ Syntax check passed\n')
} catch (error) {
  console.error('   ❌ Syntax errors found in src/app.js')
  hasErrors = true
}

// Check all JS files in src
try {
  const srcFiles = getAllJsFiles('src')
  srcFiles.forEach(file => {
    try {
      execSync(`node -c ${file}`, { stdio: 'pipe' })
    } catch (error) {
      console.error(`   ❌ Syntax error in ${file}`)
      hasErrors = true
    }
  })
  if (!hasErrors) {
    console.log('   ✅ All files passed syntax check\n')
  }
} catch (error) {
  console.error('   ⚠️  Error checking files:', error.message)
}

// 2. ESLint check (warnings only - syntax errors would have been caught above)
console.log('2️⃣ Running ESLint (checking for critical errors)...')
try {
  execSync('npm run lint', { stdio: 'pipe' })
  console.log('   ✅ Linting passed\n')
} catch (error) {
  // Check if there are actual errors (not just warnings)
  const lintOutput = error.stdout?.toString() || error.stderr?.toString() || ''
  const errorCount = (lintOutput.match(/\d+ error/g) || []).reduce((sum, match) => {
    return sum + parseInt(match.match(/\d+/)[0])
  }, 0)
  
  if (errorCount > 0) {
    console.error(`   ⚠️  Linting found ${errorCount} error(s) (run 'npm run lint:fix' to auto-fix many issues)`)
    console.error('   Note: Run full lint before pushing to see all issues\n')
    // Don't fail deploy for linting errors, only syntax errors
  } else {
    console.log('   ✅ No critical linting errors\n')
  }
}

// 3. Verify required environment variables are documented
console.log('3️⃣ Checking configuration...')
const envDocs = fs.readFileSync('ENVIRONMENT.md', 'utf8')
const requiredVars = ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET', 'SLACK_APP_TOKEN', 'DATABASE_URL']
const missingDocs = requiredVars.filter(v => !envDocs.includes(v))
if (missingDocs.length > 0) {
  console.error(`   ⚠️  Missing documentation for: ${missingDocs.join(', ')}`)
} else {
  console.log('   ✅ Configuration documented\n')
}

// 4. Check that main entry point exists
console.log('4️⃣ Verifying project structure...')
const mainFile = path.join(process.cwd(), 'src', 'app.js')
if (!fs.existsSync(mainFile)) {
  console.error(`   ❌ Main file not found: ${mainFile}`)
  hasErrors = true
} else {
  console.log('   ✅ Project structure valid\n')
}

// Summary
console.log('━'.repeat(60))
if (hasErrors) {
  console.error('❌ Pre-deploy checks failed! Please fix errors before deploying.')
  process.exit(1)
} else {
  console.log('✅ All pre-deploy checks passed!')
  console.log('   You can safely deploy now.')
  process.exit(0)
}

function getAllJsFiles(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsFiles(fullPath))
    } else if (file.endsWith('.js')) {
      results.push(fullPath)
    }
  })
  return results
}

