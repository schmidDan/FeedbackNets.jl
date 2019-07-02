var documenterSearchIndex = {"docs":
[{"location":"#FeedbackConvNets.jl-Docs-1","page":"Home","title":"FeedbackConvNets.jl Docs","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"Welcome to the documentation of FeedbackConvNets.jl.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"FeedbackConvNets is a Julia package based on Flux that implements recurrent connections between different layers of a deep network. This makes it possible to have feedback connections from higher/later layers in the networks to lower/earlier layers.","category":"page"},{"location":"#Contents-1","page":"Home","title":"Contents","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"Pages = [\"guide/getting_started.md\", \"guide/chains_vs_trees.md\"]","category":"page"},{"location":"guide/getting_started/#Getting-Started-1","page":"Getting Started","title":"Getting Started","text":"","category":"section"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"FeedbackNets is a Julia package based on Flux. If you are new to Julia, there are great learning resources here and the documentation is helpful too. In order to get to know Flux, have a look at their website and documentation.","category":"page"},{"location":"guide/getting_started/#Installation-1","page":"Getting Started","title":"Installation","text":"","category":"section"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"The package can be installed using Pkg.add()","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"using Pkg\nPkg.add(\"https://github.com/cJarvers/FeedbackNets.jl.git\")","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"or using the REPL shorthand","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"] add https://github.com/cJarvers/FeedbackNets.jl.git","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"The package depends on Flux. CuArrays is required for GPU support.","category":"page"},{"location":"guide/getting_started/#Basic-Usage-1","page":"Getting Started","title":"Basic Usage","text":"","category":"section"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"Once the package is installed, you can access it with Julia's package manager:","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"using FeedbackNets","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"Typically, you'll want to load Flux as well for its network layers:","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"using Flux","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"In Flux, you would build a (feedforward) deep network by concatenating layers in a Chain. For example, the following code generates a two-layer network that maps 10 input units on 20 hidden units (with ReLU-nonlinearity) and maps these to 2 output units:","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"net = Chain(\n    Dense(10, 20, relu),\n    Dense(20, 2)\n)","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"This network can be applied to an input like any function:","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"x = randn(10)\ny = net(x)","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"In order to construct a deep network with feedback, you can use a FeedbackChain, similar to the standard Flux Chain. The difference between a normal Chain and a FeedbackChain is that the latter knows how to treat two specific types of layers: Mergers and Splitters.","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"Imagine that in the network above, we wanted to provide a feedback signal from the two-unit output layer and change activations in the hidden layer based on it. This requires two steps: first we need to retain the value of that layer, second we need to project it back to the hidden layer (e.g., through another Dense layer) and add it to the activations there.","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"The first part is handled by a Splitter. Essentially, whenever the FeedbackChain encounters a Splitter, it saves the output of the previous layer to a dictionary. This way, it can be reused in the next timestep. The second part is handled by a Merger. This layer looks up the value that the Splitter saved to the dictionary, applies some operation to it (in our case, the Dense layer) and merges the result into the forward pass (in our case, by addition):","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"net = FeedbackChain(\n    Dense(10, 20, relu),\n    Merger(\"split1\", Dense(2, 20), +),\n    Dense(20, 2),\n    Splitter(\"split1\")\n)","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"Note that the name \"split1\" is used by both Merger and Splitter. This is how the Merger knows which value from the state dictionary to take. But what happens during the first feedforward pass? The network has not yet encountered the Splitter, so how does the Merger get its value? When a FeedbackChain is applied to an input, it expects to get a dictionary as well, which the user needs to generate for the first timestep. The FeedbackChain returns the updated dictionary as well as the output of the last layer.","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"state = Dict(\"split1\" => zeros(2))\nx = randn(10)\nstate, out = net(state, x)","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"If the user does not want to handle the state manually, they can wrap the net in a Flux Recur, essentially treating the whole network like on recurrent cell:","category":"page"},{"location":"guide/getting_started/#","page":"Getting Started","title":"Getting Started","text":"using Flux: Recur\nnet = Recur(net, state)\noutput = net.([x, x, x])","category":"page"},{"location":"guide/chains_vs_trees/#Controlling-Information-Flow:-Chains-vs-Trees-1","page":"Chains vs Trees","title":"Controlling Information Flow: Chains vs Trees","text":"","category":"section"},{"location":"guide/chains_vs_trees/#","page":"Chains vs Trees","title":"Chains vs Trees","text":"FeedbackNets.jl provides two types to implement deep networks with feedback: FeedbackChains and FeedbackTrees. Their interfaces are identical and they can be used interchangably. The difference between the two is how information flows through the network in the forward pass. Whereas a FeedbackChain propagates information from input to output in a single timestep, a FeedbackTree breaks this up over several timesteps.","category":"page"},{"location":"guide/chains_vs_trees/#FeedbackChains:-Fast-Forward-Passing-1","page":"Chains vs Trees","title":"FeedbackChains: Fast Forward Passing","text":"","category":"section"},{"location":"guide/chains_vs_trees/#","page":"Chains vs Trees","title":"Chains vs Trees","text":"FeedbackChains behave in a way that should be intuitive to users of pure feedforward networks: in each timestep, all layers are applied sequentially to transform input into output. There is feedback across timesteps via Splitters and Mergers, but this does not change the fact that the network can be conceptualized as a sequence of layers.","category":"page"},{"location":"guide/chains_vs_trees/#","page":"Chains vs Trees","title":"Chains vs Trees","text":"However, this means that there is a fundamental asymmetry between information passed in the forward and the backward direction. Imagine a model of ten layers, each of which provides feedback to the previous one. A change in the input will propagate forward to the final layer within one timestep. However, in order for feedback from the top layer to affect what happens in the lowest layer of the network, it has to propagate to layer 9 (which takes one timestep), then to layer 8 (another timestep) and so on. It will take 9 timesteps to reach the first layer.","category":"page"},{"location":"guide/chains_vs_trees/#","page":"Chains vs Trees","title":"Chains vs Trees","text":"This asymmetry is abolished in FeedbackTrees","category":"page"},{"location":"guide/chains_vs_trees/#FeedbackTrees:-Symmetric-Passing-1","page":"Chains vs Trees","title":"FeedbackTrees: Symmetric Passing","text":"","category":"section"},{"location":"guide/chains_vs_trees/#","page":"Chains vs Trees","title":"Chains vs Trees","text":"In a feedback tree, layers are applied to the input in sequence until the first Splitter is encountered. As in a FeedbackChain, the current value is saved to the state dictionary. However, the network then retrieves the value stored at the previous timestep and applies the next layers to that. In the ten-layer network scenario outlined above, this means that ten timesteps are necessary for a new input to affect the output layer. Information spreads with the same speed in the forward and backward direction.","category":"page"}]
}
