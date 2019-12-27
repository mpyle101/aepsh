import readline from 'readline'
import yargs from 'yargs/yargs'

const DEFAULT_PROMPT = '>> '

/*** shell ***/
export const shell = (
  name: string,
  prompt = DEFAULT_PROMPT,
  istream = process.stdin,
  ostream = process.stdout
) => new Shell(name, prompt, istream, ostream)


/*** Route ***/
class Route {
  constructor(private name: string, private shell: Shell) {}

  cmd(
    name: string,
    desc: string,
    handler: (args: any) => void
  ) {
    this.shell.cmd(`${this.name} ${name}`, desc, handler)
  }
}


/*** Shell ***/
class Shell {
  private rl: readline.Interface
  private cmds = new Map()
  private state = new Map()
  private parser = yargs()

  constructor(
    name: string,
    prompt: string,
    istream: NodeJS.ReadStream,
    ostream: NodeJS.WriteStream
  ) {
    this.parser
      .scriptName(name)
      .exitProcess(false)

    this.parser.command('$0', 'unknown command', {}, () => console.log('unknown command'))
    this.parser.command('exit', 'exit the application', {}, () => process.exit(0))
    this.parser.command('quit', 'exit the application', {}, () => process.exit(0))

    this.rl = readline.createInterface(istream, ostream)
    this.rl.setPrompt(prompt)
    this.rl.on('close', () => process.exit())
    this.rl.on('line', line => {
      try {
        const argv = this.parser.parse(line, (err, argv, output) => {
          if (output) {
            console.log(output)
          }
        })
        console.log('ARGV', argv)
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
    desc: string,
    handler: (args: any) => void
  ) {
    this.cmds.set(name, handler)
    return this.parser.command(name, desc, {}, args => this.call(name, args))
  }

  call(cmd: string, args) {
    console.log(`cmd: ${cmd}, args: ${args}`)
    this.cmds.get(cmd)(args)
  }
}

