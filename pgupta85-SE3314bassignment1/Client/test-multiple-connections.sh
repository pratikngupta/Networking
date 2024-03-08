
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

testNumber=0

# Create an array with the image names
images=("BleedingHeart.gif" "CallaLily.gif" "Canna.gif" "Cardinal.jpeg" "CherryBlossom.gif" "Deer.png" "Dog.jpeg" "Flamingo.jpeg" "Flicker.jpeg" "Parrot.jpeg" "Rose.gif" "Swan.jpeg")

# Create a function to test server with multiple connections at once
function testServerMultiple {
    let "testNumber++"
    echo -e "\033[0;32mTest Number: $testNumber"
    echo -e "Test: Getting $@\033[0m"
    for image in "$@"
    do
        node GetImage -s $SERVER -q $image -v 9 &
    done
    echo ""
}

# Test the server with multiple connections at once
testServerMultiple "${images[@]:0:5}"


wait
exit 0