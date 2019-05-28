<?php

$authKey = ""; // Hidden from git
$filename = "food.json";

// Authentication check
if(!isset($_POST["auth"]) || gettype($_POST["auth"]) !== "string")
    exit("No authentication key");
$inpAuth = preg_replace("([^0-9a-zA-Z])", "", $_POST["auth"]);
if($inpAuth !== $authKey)
    exit("Invalid authentication key");

// Validate food data
if(!isset($_POST["food"]) || gettype($_POST["food"]) !== "string")
    exit("Invalid data");

try {
    $food = json_decode($_POST["food"], true);
}
catch(Exception $e){
    exit("Invalid data");
}

// Load old food data
try {
    $oldFile = file_get_contents($filename);
    $old = json_decode($oldFile, true);
}
catch(Exception $e){
    exit("Unable to update data");
}

// Loop through new data and add new to existing
try {
    foreach($food as $week => $data){
        if(!array_key_exists($week, $old)){
            $old[$week] = $data;
        }
    }
}
catch(Exception $e){
    exit("Unable to update data");
}

// Save data
$newData = json_encode($old);
file_put_contents($filename, $newData);
echo "Successfully updated data";
