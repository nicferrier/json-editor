
import { createRequire } from 'module';
import { fileURLToPath as fromURL } from 'url';
const require = createRequire(fromURL(import.meta.url));
const donovan = require("./donovan.js");
const parseJson = donovan(require("clarinet"));

export default parseJson;

// End
