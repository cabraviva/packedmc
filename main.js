const generator = async (prompts, validationRegExes, about, dir, cmd, mergeScript, removeDefault, chalk, fs) => {
    /*
        DON'T DELETE THIS COMMENT, YOU MIGHT NEED IT LATER

        This function will get run when creating boilerplate code.
        You can use the above defined methods to generate code
        Here's a brief explanation of each:

        prompts: contains various prompt functions to get input frome the use
            {
                async prompt(question, defaultValue = '', validationRegEx = null, canBeEmpty = false, validatorFunction = null) => string // NOTE: The validatorFunction can be async
                async confirm(question) => true|false
                async numeral(question, validatorFunction) => number
                async toggle(question, option1, option2) => option1|option2
                async select(question, [...choices]) => choice
                async multiSelect(question, [...choices], min = 0, max = Infinity) => [...choices]
            }
        validationRegExes: contains various RegExes that are useful when dealing with prompts. As of now:
            {
                identifier: Allows a-z, A-Z, -, _, @, ~ and .
                license: Allows valid SPDX licenses, UNKNOWN and SEE LICENSE IN <file>
                repository: Allows github repos, eg. username/repo
                email: Allows valid emails,
                confirmation: Allows yes, no, y and n
                username: Allows typically valid usernames
                url: Allows urls with optional protocol
                phone: Allows international phone numbers
            }
        about: contains whatever the user specified using nautus me. NOTE: All fields can be empty
            {
                realName,
                githubUsername,
                name,
                gender,
                email
            }
        dir: path to the directory where the project files are saved
        cmd: function that allows you to run commands jsut like in a nautus script
            async cmd(command: string) => [exitCode, stdout]
        mergeScript: function that allows you to merge code into a script. NOTE: Don't include the boilerplate for a script, jsut include what needs to be put in the function
            // scriptName shall not include @ or .js
            mergeScript(scriptName, code) => void
        removeDefault: function that removes the default error from a script
            // scriptName shall not include @ or .js
            removeDefault(scriptName) => void
        chalk: chalk module to help you style your console.log's. See https://www.npmjs.com/package/chalk for more
        fs: like the default fs module, but writeFile and writeFileSync are protected
            and ask user before overwriting existing files.
            NOTE: Usage of require('fs') is prohibited to protect the users data
    */

    const { prompt, confirm, numeral, toggle, select, multiSelect } = prompts
    const { identifier, repository } = validationRegExes
    const path = require('path')

    // Do your prompts here
    const packName = await prompt('Pack Name', 'mydatapack', identifier)
    const license = await prompt('License', 'MIT', validationRegExes.license)

    // Do your generation here
    const pkgJSON = {
        name: packName,
        version: '1.0.0',
        description: '',
        main: 'src/pack.js',
        scripts: {
            test: "echo \"Error: no test specified\" && exit 1"
        },
        keywords: [],
        author: `${about.name || about.githubUsername || '?'} (https://github.com/${about.githubUsername || '?'})`,
        license,
        dependencies: {}
    }
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkgJSON, null, 4))
    fs.ensureFileSync(path.join(dir, 'README.md'))
    fs.ensureDirSync(path.join(dir, 'src'))
    fs.ensureFileSync(path.join(dir, 'src', 'pack.js'))
    fs.ensureFileSync(path.join(dir, 'src', 'setup.js'))
    fs.ensureFileSync(path.join(dir, 'src', 'main.js'))

    // @Build.js
    removeDefault('Build') // Removes the default error message
    mergeScript('Build', `exit(await spawn('node', ["src/pack.js"]))`)

    await cmd('npm i packedmc -D')

    console.log(chalk.green(`Successfully generated datapack. Build it using ${chalk.cyan('nautus build')}. Start writing code in your src/pack.js file, where your pack is defined. If you want to automatically copy`))
}

module.exports = {
    generator: generator, // This will get run if you use nautus kelp (aka want to create boilerplate in afresh project)
    use: generator, // This will get run if you use nautus use (aka want additional boilerplate or support for a framework / runtime). Make sure that this won't replace important stuff
    commands: () => {
        /*
            If you just want to create boilerplate code, this function is irrelevant for you.
            If you want to create commands anyways, use "nautus use commands"
            in this project to add command support.
        */
    },
    gitIgnore: `# If you want to merge something into the .gitignore, add it here`
}