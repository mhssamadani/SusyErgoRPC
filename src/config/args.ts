const {ArgumentParser} = require('argparse');
const {version} = require('../package.json');

const parser = new ArgumentParser({
    description: 'Argparse example'
});

parser.add_argument('-v', '--version', {action: 'version', version});
parser.add_argument('-s', '--service', {help: 'specify service to run options are `rpc` and `sign`'});
parser.add_argument('-p', '--private', {help: 'private key for signing service'});
parser.add_argument('-i', '--index',  {help: 'guardian index for signing service'});


export default parser;
