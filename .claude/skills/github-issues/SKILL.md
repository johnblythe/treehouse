---
name: github-issues
description: Create and manage GitHub issues for tracking work. Use for breaking down features, bugs, and tasks.
---

# GitHub Issues Workflow

## Creating Issues

Use `gh issue create` with proper labels and descriptions:

```bash
# Feature issue
gh issue create --title "feat: [title]" --body "[description]" --label "enhancement"

# Bug issue
gh issue create --title "fix: [title]" --body "[description]" --label "bug"

# Task/chore issue
gh issue create --title "chore: [title]" --body "[description]" --label "chore"
```

## Issue Body Template

```markdown
## Summary
[1-2 sentence description]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Notes
[Optional implementation hints]
```

## Listing Issues

```bash
gh issue list                    # All open issues
gh issue list --label "bug"      # Filter by label
gh issue list --assignee @me     # Assigned to me
```

## Working on Issues

```bash
# Create branch from issue
git checkout -b feat/issue-[number]-[short-name]

# Reference in commits
git commit -m "feat: implement X (closes #123)"
```

## Closing Issues

Issues auto-close when PR merges with "closes #X" in commit/PR body.

Manual close:
```bash
gh issue close [number] --comment "Completed in [commit/PR]"
```
