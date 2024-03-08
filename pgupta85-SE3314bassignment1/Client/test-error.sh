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
images=("BleedingHeart.pdf" "Canna.gif" "cow.png")

let "testNumber++"
echo -e "\033[0;32mTest Number: $testNumber"
echo -e "Test: Getting ${images[0]}: incorrect file extension\033[0m,"
echo -e "\033[0;34mCommand to run:\033[0m node GetImage -s $SERVER -q ${images[0]} -v 9"
node GetImage -s $SERVER -q ${images[0]} -v 9
echo ""

let "testNumber++"
echo -e "\033[0;32mTest Number: $testNumber"
echo -e "Test: Getting ${images[1]}: inncorrect Packet\033[0m,"
echo -e "\033[0;34mCommand to run:\033[0m node GetImage -s $SERVER -q ${images[1]} -v 10"
node GetImage -s $SERVER -q ${images[1]} -v 10
echo ""

let "testNumber++"
echo -e "\033[0;32mTest Number: $testNumber"
echo -e "Test: Getting ${images[2]}: File Not found\033[0m,"
echo -e "\033[0;34mCommand to run:\033[0m node GetImage -s $SERVER -q ${images[2]} -v 9"
node GetImage -s $SERVER -q ${images[2]} -v 9
echo ""

let "testNumber++"
echo -e "\033[0;32mTest Number: $testNumber"
echo -e "Test: Getting ${images[1]}: Wrong arrgument\033[0m,"
echo -e "\033[0;34mCommand to run:\033[0m node GetImage"
node GetImage
echo ""

exit 0
