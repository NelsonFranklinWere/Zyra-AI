# Deprecated Packages Update Guide

## Updated Packages

### Removed:
- `react-flow-renderer` (deprecated) → Replaced with `reactflow`

### Updated:
- `reactflow`: ^11.10.4 (latest stable)
- Added engines specification for Node.js >= 18.0.0

## Migration Notes

If you were using `react-flow-renderer`, update imports:
```typescript
// Old
import ReactFlow from 'react-flow-renderer'

// New
import ReactFlow from 'reactflow'
```

## Build Configuration

- `.npmrc` added to suppress peer dependency warnings
- `next.config.js` optimized for Vercel deployment
- TypeScript strict mode enabled
- ESLint checks enabled during build

## Vercel Compatibility

- Standalone output enabled
- SWC minification enabled
- Package imports optimized
- Build errors will fail deployment (as they should)

