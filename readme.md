# @kuankuan/assist-2024

This module is an extension to the ECMAScript specification that provides additional functionality without relying on any runtime.

**Warning**: This module will pollute the global environment, so use it with caution.

## Global Pollution

Since this module will intrude the global environment, it adds properties to `globalThis`. The following explanation is provided.

### Global Property Name Naming Convention

The property names declared by this module meet the following conditions, and if there are naming conflicts, they should be handled by the user.

1. The property name starts with the letter K
2. The property name is camelCase or all uppercase letters

## Usage

Make sure that the conflicting properties in `globalThis` have been handled before importing this module.

```js
import '@kuankuan/assist-2024';
```

After this, you can access the functionality anywhere in the code

## License

This project is licensed under the [MulanPSL-2.0](./LICENSE)
