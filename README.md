# mptcp-tools

This repository contains tools around my videos on Multipath TCP (MPTCP)

Here is the first video [Faster Internet with MPTCP ](https://youtu.be/VlnnH5RtvSE)
and the second part [Faster Internet with OpenMPTCPRouter by ysurac](https://youtu.be/mYYoIDCWszo)


run the makescript.sh which will then create the fetch_ycarus_kernel.sh
Running fetch_ycarus_kernel will go to Yannick Chabanois' (ysurac) [ysurac github](https://github.com/Ysurac) and download an MPTCP enabled kernel from there.

The nodejs subdirectory contains the webfrontend for the shaper Machines, i.e. a simple frontend to the Linux Queuing Discipline interface, tc.

In order to use it, adjust the server parameters in the qdiscs.js file to match your environment:

var serverList = 
{
  numberServers:3,
  servers:[
            {"name":"shaper1","ip":"10.8.0.1","user":"root","keyFile":"id_shaper1","interfaces":["eth0","eth1"]},
            {"name":"shaper2","ip":"10.7.0.1","user":"root","keyFile":"id_shaper2","interfaces":["eth0","eth1"]},
            {"name":"shaper3","ip":"10.9.0.1","user":"root","keyFile":"id_shaper3","interfaces":["eth0","eth1"]}
          ]
}

(in my case this is shaper1, shaper2 and shaper3).

You can then launch the script locally by typing

node qdiscs.js

Browse to port 8080 of the local host and you can now set the speed, latency and error rates of the interfaces on the shaper machines.

Behind the scenes that nodejs script just ssh'es into the shaper machines and launches tc in order to create a qdisc with the netem filter. This way you can simulate multiple connections and give them different characteristics such as LTE, DLS etc.

Find all details on [my youtube channel](https://www.youtube.com/channel/UCG5Ph9Mm6UEQLJJ-kGIC2AQ)