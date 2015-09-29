#!/bin/bash

# Replace the FCT_NAMES with the Outputs in your CloudFormation template.

LAMBDA_FCT_FOLDERS=('getSBSFleet' 'readSBSData' 'writeSBSData')
LAMBDA_FCT_NAMES=('<GetSBSFleet-NAME>' '<ReadSBSData-NAME>' '<WriteSBSFleet-NAME>' )
mkdir temp
for i in "${!LAMBDA_FCT_FOLDERS[@]}"; do
    read -p "Do you want to deploy lambda function: ${LAMBDA_FCT_NAMES[$i]}? " -n 1 -r
    echo    # (optional) move to a new line
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
      zip -r temp/${LAMBDA_FCT_FOLDERS[$i]}.zip ../lambda/${LAMBDA_FCT_FOLDERS[$i]}/index.js ../lambda/${LAMBDA_FCT_FOLDERS[$i]}/node_modules
      aws lambda update-function-code \
        --function-name "${LAMBDA_FCT_NAMES[$i]}" \
        --zip-file "fileb://./temp/${LAMBDA_FCT_FOLDERS[$i]}.zip" \
        --profile iot \
        --region us-west-2
    fi
      echo "Skipping this function..."
done
rm -r -f temp/
