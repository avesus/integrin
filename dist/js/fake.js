/*
  Fake is a fake programming language.
  Although... It's a real one.

  It's not intended to be used for anything.
  It's semantics are to run DyneinScript.

  Expressions assignment and execution language.
  A parallel one, but everyone is experimenting with parallel.

  A working program must be bound to the environment.
  These bindings define OS variable assignments to happen
  matching the variables of the program.

  These correspond to the outputs.

  Symmetrically, each program has named input arguments bindslots
  (with internal fan-outs), which must be bound to OS variables
  to be consumed.

  [OS variable] -> [ [bindslot] -> -> fan-outs --- program [variable] ] -> [ [OS writeable bindslot] -> -> hidden "fan-out" to make OS work]

  A program makes its own variables a "part" of the OS combining the name of the program
  and the name of the variable:

    program1.var1 is a system variable. var1 is a program variable.

  Program is instantiated first, then it's bound to the OS.
  That means all program's variables are not connected to any outputs on its instantiation,
  and that also means that these variables are _system variables_.

  The structural problem is with inputs. When a program is instantiated, there are bindslot
  fanouts defined as placeholders inside of expressions. Without binding to real variables,
  the program is not connected to the environment.

  For bound output variables, program interpreter assigns new values to all
  input slots. Strictly speaking, writeable OS variables are bind slots too.

  Binding instantiator can connect the entire program back on itself, without even connecting it
  with the OS.

  The program binding is not defined within the program.
  Program defines names of the bindslots, either explicitly (to speed up binding), or implicitly
  (by having variable names used only as r-values). At the beginning we only support implicit bindslots.

  OS decides what variables to connect to the bindslots based on the names of the bindslots.
  In digital circuits, bindslot names are internal package pin names. These are important
  to understand the role this wire plays to make it work. The variable name is an output signal internal package pin name.
  When connected with external circuits, the name of the signal on the wire is what OS variable name is.

  OS variable name  /----------------------------------------------\ OS bindslot name
  ------------------| Bindslot name          Program variable name |------------------

  Addition:
  1) Implementation:
    
    (a, b) => add(a, b)

  2) Instantiation:

    viola = <0.75>
    bass = <0.1>

    music = add({ a: viola, b: bass })
   

  Program variables must be connected to bindslots, either OS, either program itself.
  When the "ouroboros" connection happens, the name of the program is preserved
  on the inputs connections.

  Given OS variable name
    os.input

  binding happens with

    apps.app1.in1 = os.input

  Output binding:

    os.output = apps.app1.out1


  The program on itself:

    apps.app1.in2 = apps.app1.out2

  Binding never runs expressions, only bindings (single assignments).


  Binding is not a part of the program, it's a part of program instantiation.
  Program instantiation is a mini-program, defined in the scope of the OS.

  To instantiate a program, the source code of it is required:

    apps.app1 = `
      out1 = in1 + in2
      out2 = in2
    `
  
  Binding is also required:

    apps.app1.in1 = os.input
    apps.app1.in2 = apps.app1.out2

  Every program variable introduces a temporal delay. Despite binding made for the variable on itself,
  the assignment happens for the previous value.

  Source code can be a variable (although, a "constant") too. And so bindings:

  app1source = `
    out1 = in1 + in2
    out2 = in2
  `
  app1bindings = `
    apps.app1.in1 = os.input
    apps.app1.in2 = apps.app1.out2
  `

  To instantiate a program, source code and binding must be provided as values
  into special OS input slots. (Who is the agent requesting these things? :-) )

  os.instantiateRequestSourceCode = app1source
  os.instantiateRequestBindingsSource = app1bindings

  Then _external actor_ requesting OS to load a program, must _change its own state_
  to indicate the OS that the program must be loaded.

  To load programs, system can't be closed. An external agency must provide commands and data.

  OS can have an externally available API, to put the described program and bind it.
  OS has a set of named variables and bindslots which can be created using the API.

  Each program is nothing else but a set of these.

  This externally available API is how new programs come in.

  That means that internally, in terms of the semantics of the OS binder and loader,
  some bindslots can take on arbitrary values assigned by external agents at arbitrary moments.

  For the OS, it will look like those values appear from nowhere.
  So the instantiateRequestSourceCode assignments are _external_, we can't write them inside of the OS.

  We can assume that instantiation can take time, so OS is allowed to provide an

    os.instantiatorIsReady output variable visible to the external agent which they can use to request a new program instance.

  Variables can be created without anything. These are just free variables _users_ allowed to use.

  Variables can only be creates inside of the apps scope.
  We can only support one app in the first implementation.

  Variables can be removed by the command

    delete app.out1

  Bindslots can be bound:

    app.in1 = os.out1


  The same assignment syntax is used to connect bindslots and to create expressions.
  Because r-values are always _previous_ values, and binding semantics are _slot replacements_,
  given an app

    app.out1 = app.in1 + app.in2
    app.out2 = app.in2

  after binding with

    app.in1 = os.input
    app.in2 = app.out2

  becomes
  
    app.out1 = os.input + app.out2
    app.out2 = app.out2

  Note that binder removes the original bindslot names from the program.
  To preserve those names, intermediate variables must be created.

  The program is not deterministic on initialization, and so real circuits.
  The value of "out2" can be anything upon instantiation, because it lacks
  a "reset" initializer. OS implementation can decide to initialize them into 0s, 1s, or any random values.
  The code is still _valid_ and must be allowed to be used. This is the key difference from Verilog/VHDL.
  We allow combinational loops, and always resolve them, imitating two clocks, one super fast to resolve the loops,
  assuming that each Boolean logic gate has an "invisible" D flip-flop attached to its output.
  Fan-outs also can assume the same property, when there are many instances of bind slot with the same name.

  "Ordinary" clock typically used in digital circuits is a high-level clock which simply defined by
  the low-level circuit variables. It has delays. D flip-flops are constructed "manually":

  "Pretend we run this game loop at 10 GHz"

    loop1 = clk ? loop1 : data
    loop2 = clk ? data : loop2
    dff = clk ? loop1 : loop2

  "Pretend that the clk variable changes at 400 MHz"

  With syntactic sugar:

    dff = clk ? (clk ? _ : data) : (clk ? data : _)

  In ordinary programs, the unused expression of if-then-else is not evaluated.
  In our code, it does. If you're trying to simplify an expression, pay attention to this fact:

    dff = clk ? (clk ? _ : data) : (clk ? data : _)

  will expand automatically into the original expression:

    dff.bindslot1 = clk ? dff.bindslot1 : data
    dff.bindslot2 = clk ? data : dff.bindslot2
    dff = clk ? dff.bindslot1 : dff.bindslot2

    dff = if clk then
      (if dff.if then
        dff.then else
        data
      ) else
      (if dff.if then
        data else
        dff.else
      )



*/

