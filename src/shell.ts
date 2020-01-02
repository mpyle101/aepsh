import readline from 'readline'
import yargs from 'yargs/yargs'

const DEFAULT_PROMPT = '>> '

/*** shell ***/
export const shell = (
  prompt = DEFAULT_PROMPT,
  istream = process.stdin,
  ostream = process.stdout
) => new Shell(prompt, istream, ostream)


/*** Route ***/
class Route {
  constructor(private name: string, private shell: Shell) {}

  cmd(
    name: string,
    args: string,
    desc: string,
    handler: (args: any) => void
  ) {
    return this.shell.cmd(`${this.name} ${name}`, args, desc, handler)
  }
}


/*** Shell ***/
class Shell {
  private rl: readline.Interface
  private cmds = new Map()
  private state = new Map()
  private parser = yargs()

  constructor(
    prompt: string,
    istream: NodeJS.ReadStream,
    ostream: NodeJS.WriteStream
  ) {
    this.parser
      .scriptName('')
      .exitProcess(false)

    this.parser.command('exit', 'exit the application', {}, () => process.exit(0))
    this.parser.command('quit', 'exit the application', {}, () => process.exit(0))

    this.rl = readline.createInterface(istream, ostream)
    this.rl.setPrompt(prompt)
    this.rl.on('close', () => process.exit())
    this.rl.on('line', async line => {
      try {
        const argv = this.parser.parse(line, () => {})
        console.log('ARGV', argv)
        if (argv._.length) {
          await this.cmds.get(argv._[0])(argv)
        } else if (argv.help) {
          this.parser.showHelp()
        }
      } catch (e) {
        //console.log(e)
      }
      this.rl.prompt()
    })
  }

  run() { 
    this.parser.help()
    this.rl.prompt()
  }

  set prompt(prompt: string) { this.rl.setPrompt(prompt) }
  set(key: string, value: any) { this.state.set(key, value) }
  use(name: string, desc: string) { return new Route(name, this) }

  cmd(
    name: string,
    args: string,
    desc: string,
    handler: (args: any) => void
  ) {
    this.cmds.set(name, handler)
    return this.parser.command(`${name} ${args}`, desc)
  }
}

