# Default server
SERVER="127.0.0.1:3000"

# Get parameter
while getopts s: option
do
    case "${option}"
        in
        s) SERVER=${OPTARG};;
    esac
done

# Print the server
echo -e "\033[0;32mServer: $SERVER\033[0m"

testNumber=0

# Create an array with the image names
images=("BleedingHeart.gif" "CallaLily.gif" "Canna.gif" "Cardinal.jpeg" "CherryBlossom.gif" "Deer.png" "Dog.jpeg" "Flamingo.jpeg" "Flicker.jpeg" "Parrot.jpeg" "Rose.gif" "Swan.jpeg")

# Create function to test the server with all the images
function testServer {
    let "testNumber++"
    echo -e "\033[0;32mTest Number: $testNumber"
    echo -e "Test: Getting $1\033[0m"
    echo -e "\033[0;34mCommand to run:\033[0m node GetImage -s $SERVER -q $1 -v 9"
    node GetImage -s $SERVER -q $1 -v 9
    echo ""
}

for image in "${images[@]}"
do
    testServer $image
done

