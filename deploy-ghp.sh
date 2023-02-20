#!/bin/bash

git push origin --delete gh-pages
git branch -D gh-pages

git checkout --orphan gh-pages

git rm --cached -rf .

git add deploy-ghp.sh
git commit -m "Add deploy script"

REM git clean -n
git clean -f

git rm --cached deploy-ghp.sh
git commit -m "Remove deploy script"

echo .gitignore >.gitignore
{
    echo docs
    echo node_modules
    echo wip
    echo deploy-ghp.sh
    echo package.json
    echo pnpm-lock.yaml
    echo README.md
} >>.gitignore

cp -r docs/.vitepress/dist .

git add .
git commit -m "Deploy"
git push --set-upstream origin gh-pages

git checkout main
