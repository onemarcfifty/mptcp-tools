#!/bin/bash

# install a multipath tcp enabled Kernel
# from Ycarus (Yannick Chabanois)'s OpenMPTCPRouter
# 

# download the VPS script from Yannick's site
wget https://www.openmptcprouter.com/server/debian10-x86_64.sh

OUTPUTFILE=fetch_ycarus_kernel.sh

# get the four lines with the needed variables

echo "#!/bin/bash" >$OUTPUTFILE

cat debian10-x86_64.sh | grep "KERNEL_VERSION=" >>$OUTPUTFILE
cat debian10-x86_64.sh | grep "KERNEL_PACKAGE_VERSION=" >>$OUTPUTFILE
cat debian10-x86_64.sh | grep "VPSURL=" >>$OUTPUTFILE
cat debian10-x86_64.sh | grep "KERNEL_RELEASE=" >>$OUTPUTFILE


# get the two lines which include the kernel download 
cat debian10-x86_64.sh | grep "wget -O /tmp/linux" >>$OUTPUTFILE

chmod 755 $OUTPUTFILE
