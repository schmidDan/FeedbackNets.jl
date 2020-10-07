module DelayedTupleMergers

using ..AbstractMergers: AbstractMerger
import ..Mergers: inputname

export DelayedTupleMerger,
       DelayedTupleMergerPadded

    """
        DelayedTupleMerger{F,O}

    An element in a `FeedbackChain` in which multiple 'Splitters' state from
    the previous iteration ae mapped to a `Tuple`.

    # Fields
    - `splitnames::Tuple{String,Vararg{Int,N}}`: name of the `Splitter` nodes
        from which the states are taken

    # Details
    When a `FeedbackChain` encounters a `DelayedTupleMerger`, it will look up
    the states of the `Splitter`s given by `splitnames` from the previous
    timestep, wrap them into a `Tuple`, and forward it.
    """
    struct DelayedTupleMerger{N} <: AbstractMerger
        splitnames::Tuple{Vararg{String,N}}
    end # struct DelayedTuplerMerger

    function (m::DelayedTupleMerger)(x, y)
        map(splitname -> y[splitname], m.splitnames)
    end

    struct DelayedTupleMergerPadded{N} <: AbstractMerger
        splitnames::Tuple{Vararg{String,N}}
        paddings::Tuple{Vararg{Tuple,N}}
    end # struct DelayedTuplerMerger

    function (m::DelayedTupleMergerPadded)(x, y)
        tup = ()
        for tupleind in 1:length(m.splitnames)
            splitname = m.splitnames[tupleind]
            if splitname == "none"
                tup = (tup..., (zeros(m.paddings[tupleind][1]),zeros(m.paddings[tupleind][2])))
            else
                tup = (tup...,y[splitname])
            end
        end
        return tup
    end

    ## These overloads ensure that a Merger behaves as Flux expects, e.g.,
    ## when moving to gpu or collecting parameters.
    #children(m::Merger) = (m.fb, m.op)
    #mapchildren(f, m::Merger) = Merger(m.splitnames, f(m.fb), m.op)

    """
        inputname(m::DelayedTupleMerger)

    Return the name of the `Splitter`s
    """
    inputname(m::DelayedTupleMerger) = m.splitnames

    function show(io::IO, m::DelayedTupleMerger)
        print(io, "DelayedTupleMerger(\"", m.splitnames, ")")
    end # function show

    """
        inputname(m::DelayedTupleMergerPadded)

    Return the name of the `Splitter`s
    """
    inputname(m::DelayedTupleMergerPadded) = m.splitnames

    function show(io::IO, m::DelayedTupleMergerPadded)
        print(io, "DelayedTupleMergerPadded(\"", m.splitnames, m.paddings, ")")
    end # function show


end # module DelayedTupleMergers
