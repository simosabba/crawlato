const sh = require("shelljs")
const args = process.argv.slice(2).join(" ")
sh.config.fatal = true
sh.config.verbose = true
sh.exec(`cdk diff ${args}`)
sh.exec(`cdk bootstrap`)
sh.exec(`cdk deploy ${args} --require-approval never`)
