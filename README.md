# SVGStore

This repo is fork of [svgstore](https://github.com/svgstore/svgstore) with Typescript implementation and ES Module support, which is built with [swc](https://swc.rs/) instead of [Babel](https://babeljs.io/).

## Installation

```
npm i @jayson991/svgstore
```

## Usage

### For ES Module

```javascript
import fs from 'node:fs';
import SVGStore from '@jayson991/svgstore';

const sprites = new SVGStore()
  .add('unicorn', fs.readFileSync('./unicorn.svg', 'utf8'))
  .add('rainbow', fs.readFileSync('./rainbow.svg', 'utf8'));

fs.writeFileSync('./sprites.svg', sprites);
```

### For Commonjs

```javascript
const fs = require('node:fs');
const SVGStore = require('@jayson991/svgstore');

const sprites = new SVGStore()
  .add('unicorn', fs.readFileSync('./unicorn.svg', 'utf8'))
  .add('rainbow', fs.readFileSync('./rainbow.svg', 'utf8'));

fs.writeFileSync('./sprites.svg', sprites);
```

## Sprites Usage

The resulting file may be consumed in markup as external content.

```html
<body>
  <svg role="img"><use xlink:href="./sprites.svg#unicorn" /></svg>
  <svg role="img"><use xlink:href="./sprites.svg#rainbow" /></svg>
</body>
```

See [examples](./docs/examples) folder for more detail.

## API

See the [test](./test) folder for more ditail.

## Contributing

Standards for this project, including tests, code coverage, and semantics are enforced with a build tool. Pull requests must include passing tests with 100% code coverage and no linting errors.

### Test

```
npm test
```
