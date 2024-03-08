


echo "Running Simple Check"
bash test-simple-check.sh
wait


# ask to continue
read -p "Press enter to continue"

rm -rf downloads

clear

echo "Multiple Connections"
bash test-multiple-connections.sh

wait

# ask to continue
read -p "Press enter to continue"
clear

echo "Error Handling"
bash test-error.sh