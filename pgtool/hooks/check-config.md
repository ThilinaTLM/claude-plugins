---
event: SessionStart
---

Check if a `.pgtool.json` configuration file exists in the project root.

```bash
if [ -f ".pgtool.json" ]; then
  echo '{"configured": true}'
else
  echo '{"configured": false, "message": "No .pgtool.json found. To use pgtool, create a .pgtool.json file with your PostgreSQL connection details. See the pgtool skill for setup instructions."}'
fi
```
