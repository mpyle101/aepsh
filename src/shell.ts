import readline from 'readline'
import yargs from 'yargs/yargs'

const DEFAULT_PROMPT = '> '

export const shell = (
  name: string,
  prompt = DEFAULT_PROMPT,
  istream = process.stdin,
  ostream = process.stdout
) => new Shell(name, prompt, istream, ostream)

class Route {
  private cmds: string[] = []
  protected parser = yargs()

  constructor(cmd: string) {
    this.parser
      .scriptName(cmd)
      .exitProcess(false)
      .command('$0', '', {}, this.unknown.bind(this))
  }

  cmd(
    cmd: string,
    desc: string,
    handler: (args: any) => void,
    builder?: (args: any) => void
  ) {
    this.cmds.push(cmd)
    return this.parser.command(cmd, desc, builder || {}, handler)
  }

  call(args, state) {
    this.parser.parse(args._.slice(1), { ...state })
  }

  protected unknown(args) {
    args._.length
      ? console.log('Unknown sub-command:', args._[0])
      : console.log('Sub-command required:', this.cmds)
    this.parser.showHelp()
  }
}

class Shell extends Route {
  private state = {}
  private rl: readline.Interface

  constructor(
    name: string,
    prompt: string,
    istream: NodeJS.ReadStream,
    ostream: NodeJS.WriteStream
  ) {
    super(name)

    this.parser
      .command('exit', 'exit the application', {}, () => process.exit(0))
      .command('quit', 'exit the application', {}, () => process.exit(0))

    this.rl = readline.createInterface(istream, ostream)
    this.rl.setPrompt(prompt)

    this.rl.on('close', () => process.exit())
    this.rl.on('line', async line => {
      try {
        await this.parser.parse(line.trim(), { ...this.state })
      } catch (e) {
        console.log(e)
      }
      this.rl.prompt()
    })
  }

  set prompt(prompt: string) {
    this.rl.setPrompt(prompt)
  }

  set(key: string, value: any) {
    this.state[key] = value
  }

  run() {
    this.parser.help()
    this.rl.prompt()
  }

  use(cmd: string, desc: string) {
    const route = new Route(cmd)
    this.parser.command(cmd, desc, {}, args => route.call(args, this.state))
    return route
  }

  protected unknown(args) {
    if (args._.length) {
      console.log('Unknown command:', args._[0])
    }
  }
}