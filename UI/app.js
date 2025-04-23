Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "http://127.0.0.1:5000/classify_image",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function() {
        if (dz.files[1]!=null) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        
        var url = "http://127.0.0.1:5000/classify_image";
        console.log("Size of base64 data:", imageData.length);
        $.ajax({
            type: "POST",
            url: url,
            contentType: "application/json",
            data: JSON.stringify({ image_data: imageData }),
            success: function (data) {
                console.log("Server response:", data);
                
                if (!data || data.length == 0) {
                    $("#resultHolder").hide();
                    $("#divClassTable").hide();
                    $("#error").show();
                    return;
                }
            
                $("#error").hide();
                $("#low_confident_error").hide();
                $("#resultHolder").empty(); // clear previous results
                $("#resultHolder").show();
                $("#divClassTable").show();
            
                const confidenceThreshold = 50;
                let filteredData = data.filter(person => {
                    return Math.max(...person.class_probability) > confidenceThreshold;
                });
                // Sort by highest confidence per detected face
                filteredData.sort((a, b) => Math.max(...b.class_probability) - Math.max(...a.class_probability));
                
                if (filteredData.length == 0) {
                    console.log("The image is not confident enough to be clasified into 1 of 5 influencer.");
                    $("#resultHolder").hide();
                    $("#divClassTable").hide();
                    $("#low_confident_error").show();
                    return;
                }

                const bestScores = {}; // Store the best scores for each person
                let count = 1;  // Counter for the number of detected faces
                filteredData.forEach((person, index) => {
                    let className = person.class;
                    let classDict = person.class_dictionary;
                    let probabilities = person.class_probability;
                    let bestScore = Math.max(...probabilities);
                    
                    let class_to_name = {
                        "elonmusk": "Elon Musk",
                        "jackma": "Jack Ma",
                        "ronaldo": "Ronaldo",
                        "shakira": "Shakira",
                        "vijay": "Vijay"
                    };
                    personName = class_to_name[className];
                    
                    let colClass = data.length === 1 ? "col-12" : "col-12 col-md-6";
                    let cardHTML = `<div class="${colClass} mb-4">                    
                    <div class="card text-center h-100 shadow-sm p-2">
                        <div class="card-body">
                            <div class="position-relative rounded-circle overflow-hidden mx-auto custom-circle-image mb-2" style="width: 100px; height: 100px;">
                                <img class="w-100 h-100" src="./images/${className}.jpg" alt="Detected Image ${count++}">
                            </div>
                            <h5 class="card-title">${personName}</h5>`;

                    if (bestScore < confidenceThreshold) {
                        cardHTML += `<p class="card-text text-warning small">⚠️ Similar to <strong>${personName}</strong><br>(${bestScore.toFixed(2)}% confidence)</p>`;
                    } else {
                        cardHTML += `<p class="card-text text-success small">✅ Detected with <strong>${bestScore.toFixed(2)}%</strong></p>`;
                    }

                    cardHTML += `
                        <table class="table table-sm table-bordered mt-2 mb-0">
                            <thead class="thead-dark">
                                <tr>
                                    <th>Player</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;

                    for (let name in classDict) {
                        let index = classDict[name];
                        let score = probabilities[index];
                        let elementName = "#score_" + name;
                        if (!(person in bestScores) || bestScores[person] < score) {
                            bestScores[person] = score;
                        }
                        cardHTML += `
                            <tr>
                                <td>${class_to_name[name]}</td>
                                <td>${score.toFixed(2)}%</td>
                            </tr>
                        `;
                        $(elementName).html(score.toFixed(2));
                    }

                    cardHTML += `
                            </tbody>
                        </table>
                        </div>
                    </div>
                    </div>`;
                    $("#resultHolder").append(cardHTML);
                    
                });
            },
            error: function (err) {
                console.error("Server error:", err);
                $("#error").show();
            }
        });
    });
    

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    $("#resetBtn").on('click', function () {
        // Clear Dropzone
        Dropzone.forElement("#dropzone").removeAllFiles(true);
    
        // Hide or reset UI results
        $("#multiPersonResults").empty(); // if using dynamic
        $("#error").hide();
        $("#low_confident_error").hide();
    
        $("#resultHolder").hide();
    });

    init();
});