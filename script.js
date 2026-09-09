// ==========================================
// 🌿 용두암 생태탐험
// ==========================================
// Firebase 사용 X
// 식물 정보는 이 파일에서 직접 관리합니다.
// ==========================================



// ==========================================
// 🌱 1. 식물 정보
// ==========================================
//
// ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
//
// 식물을 추가하려면
// 아래 형식을 복사해서 추가하면 됩니다.
//
// {
//     id: "plant003",
//     name: "식물 이름",
//     latitude: 33.000000,
//     longitude: 126.000000,
//     radius: 15,
//     image: "images/사진파일.jpg",
//     description: "식물 설명"
// }
//
// ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐


const plants = [

    {
        id: "plant001",

        name: "후박나무",

        latitude: 33.514195,

        longitude: 126.510281,

        radius: 15,

        image: "images/hubak.jpg",

        description:
            "제주 해안 지역에서 볼 수 있는 상록활엽수입니다. 잎이 두껍고 윤기가 나는 것이 특징입니다."
    },


    {
        id: "plant002",

        name: "해국",

        latitude: 33.514500,

        longitude: 126.510600,

        radius: 15,

        image: "images/haeguk.jpg",

        description:
            "바닷가 주변에서 자라는 국화과의 여러해살이풀입니다. 가을 무렵 연한 보라색 꽃을 볼 수 있습니다."
    },


    {
        id: "plant003",

        name: "테스트 식물",

        latitude: 33.515000,

        longitude: 126.511000,

        radius: 15,

        image: "images/test.jpg",

        description:
            "프로그램 작동을 확인하기 위한 테스트 식물입니다."
    }

];


// ==========================================
// ⚠️ 중요
// 위 좌표는 테스트용입니다.
//
// 실제 조사한 식물의 위치를 측정한 후
// latitude / longitude를 직접 바꾸세요.
// ==========================================



// ==========================================
// 🗺️ 2. 지도 만들기
// ==========================================

const map = L.map("map").setView(

    [33.5167, 126.5119],

    16

);


L.tileLayer(

    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    {

        attribution:
            "&copy; OpenStreetMap contributors"

    }

).addTo(map);



// ==========================================
// 📍 3. 사용자 위치
// ==========================================

let userMarker = null;

let accuracyCircle = null;

let locationWatcher = null;

let testPlantCreated = false;

// 현재 발견 대상으로 선택된 식물

let currentPlant = null;



// ==========================================
// 💾 4. 도감 데이터
// ==========================================
//
// 브라우저에 발견한 식물 ID를 저장합니다.
//

let discoveredPlants =
    JSON.parse(
        localStorage.getItem(
            "yongduam-discovered-plants"
        )
    ) || [];



// ==========================================
// 📖 5. 도감 화면 만들기
// ==========================================

function renderCollection() {


    const collection =
        document.getElementById(
            "collection"
        );


    collection.innerHTML = "";


    plants.forEach(function(plant) {


        const discovered =
            discoveredPlants.includes(
                plant.id
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "plant-card";


        // ==============================
        // 발견한 식물
        // ==============================

        if (discovered) {


            card.innerHTML = `

                <img
                    src="${plant.image}"
                    alt="${plant.name}"
                    class="plant-card-image"
                >

                <div class="plant-card-content">

                    <h3 class="plant-card-name">
                        ${plant.name}
                    </h3>

                    <div class="plant-card-status">
                        ✅ 발견 완료
                    </div>

                </div>

            `;


            card.onclick = function() {

                openPlantModal(
                    plant
                );

            };


        }


        // ==============================
        // 아직 발견하지 못한 식물
        // ==============================

        else {


            card.classList.add(
                "locked"
            );


            card.innerHTML = `

                <div class="locked-image">
                    ❓
                </div>

                <div class="plant-card-content">

                    <h3 class="plant-card-name">
                        미발견 식물
                    </h3>

                    <div class="plant-card-status">
                        🔒 아직 발견하지 않았어요
                    </div>

                </div>

            `;

        }


        collection.appendChild(
            card
        );

    });


    updateCollectionCount();

}



// ==========================================
// 🔢 6. 도감 개수
// ==========================================

function updateCollectionCount() {


    document.getElementById(
        "collection-count"
    ).textContent =

        discoveredPlants.length +
        " / " +
        plants.length;

}



// ==========================================
// 🧭 7. 탐험 시작
// ==========================================

function startExploration() {


    if (
        !navigator.geolocation
    ) {


        alert(
            "이 기기에서는 위치 정보를 사용할 수 없습니다."
        );


        return;

    }



    document.getElementById(
        "start-button"
    ).textContent =

        "🧭 탐험 중...";



    document.getElementById(
        "location-status"
    ).textContent =

        "📍 현재 위치를 확인하고 있습니다...";



    locationWatcher =
        navigator.geolocation.watchPosition(

            updateUserLocation,

            locationError,

            {

                enableHighAccuracy: true,

                maximumAge: 0,

                timeout: 10000

            }

        );

}



// ==========================================
// 📍 8. 위치 업데이트
// ==========================================

function updateUserLocation(
    position
) {


    const latitude =
        position.coords.latitude;


    const longitude =
        position.coords.longitude;


    const accuracy =
        position.coords.accuracy;
    // 테스트용 식물을 현재 GPS 위치에 배치
    if (!testPlantCreated) {

    plants[2].latitude = latitude;
    plants[2].longitude = longitude;
    plants[2].radius = 30;

    testPlantCreated = true;

    console.log(
        "🌱 테스트 식물 위치 설정 완료!",
        latitude,
        longitude
    );
}



    console.log(
        "현재 위치:",
        latitude,
        longitude
    );



    // ==============================
    // 사용자 위치 마커
    // ==============================

    if (
        userMarker === null
    ) {


        userMarker =
            L.marker(

                [
                    latitude,
                    longitude
                ]

            )
            .addTo(map)
            .bindPopup(
                "📍 현재 내 위치"
            );


        map.setView(

            [
                latitude,
                longitude
            ],

            18

        );

    }


    else {


        userMarker.setLatLng(

            [
                latitude,
                longitude
            ]

        );

    }



    // ==============================
    // GPS 정확도
    // ==============================

    if (
        accuracyCircle === null
    ) {


        accuracyCircle =
            L.circle(

                [
                    latitude,
                    longitude
                ],

                {

                    radius: accuracy,

                    color: "#4f9b68",

                    fillOpacity: 0.08

                }

            )
            .addTo(map);

    }


    else {


        accuracyCircle.setLatLng(

            [
                latitude,
                longitude
            ]

        );


        accuracyCircle.setRadius(
            accuracy
        );

    }



    document.getElementById(
        "location-status"
    ).textContent =

        "📍 GPS 위치 확인 중";



    // ==============================
    // 주변 식물 확인
    // ==============================

    checkNearbyPlants(

        latitude,

        longitude

    );

}



// ==========================================
// 🌱 9. 주변 식물 찾기
// ==========================================

function checkNearbyPlants(

    userLatitude,

    userLongitude

) {


    plants.forEach(
        function(plant) {


            // 이미 발견한 식물은
            // 다시 알리지 않음

            if (
                discoveredPlants.includes(
                    plant.id
                )
            ) {

                return;

            }



            const distance =
                calculateDistance(

                    userLatitude,

                    userLongitude,

                    plant.latitude,

                    plant.longitude

                );



            console.log(

                plant.name,

                distance.toFixed(1),

                "m"

            );



            if (
                distance <= plant.radius
            ) {


                showDiscovery(
                    plant
                );

            }

        }
    );

}



// ==========================================
// 📏 10. 두 위치 사이 거리 계산
// ==========================================

function calculateDistance(

    latitude1,

    longitude1,

    latitude2,

    longitude2

) {


    const earthRadius =
        6371000;


    const lat1 =
        latitude1 *
        Math.PI /
        180;


    const lat2 =
        latitude2 *
        Math.PI /
        180;


    const differenceLatitude =
        (
            latitude2 -
            latitude1
        ) *
        Math.PI /
        180;


    const differenceLongitude =
        (
            longitude2 -
            longitude1
        ) *
        Math.PI /
        180;


    const a =

        Math.sin(
            differenceLatitude / 2
        ) ** 2

        +

        Math.cos(lat1) *

        Math.cos(lat2) *

        Math.sin(
            differenceLongitude / 2
        ) ** 2;



    const c =

        2 *

        Math.atan2(

            Math.sqrt(a),

            Math.sqrt(
                1 - a
            )

        );


    return earthRadius * c;

}



// ==========================================
// 🎉 11. 식물 발견 알림
// ==========================================

function showDiscovery(
    plant
) {


    currentPlant = plant;



    document.getElementById(
        "discovered-plant-name"
    ).textContent =

        "🌱 " + plant.name;



    document.getElementById(
        "discovered-plant-description"
    ).textContent =

        plant.description;



    document.getElementById(
        "discovery-panel"
    )
    .classList
    .remove("hidden");



    // 발견 위치로 화면 이동

    document.getElementById(
        "discovery-panel"
    )
    .scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}



// ==========================================
// 📖 12. 도감에 등록
// ==========================================

function collectCurrentPlant() {


    if (
        currentPlant === null
    ) {

        return;

    }



    if (
        !discoveredPlants.includes(
            currentPlant.id
        )
    ) {


        discoveredPlants.push(
            currentPlant.id
        );


        localStorage.setItem(

            "yongduam-discovered-plants",

            JSON.stringify(
                discoveredPlants
            )

        );

    }



    alert(

        "🎉 도감 등록 완료!\n\n" +

        currentPlant.name +

        "을(를) 발견했습니다!"

    );



    document.getElementById(
        "discovery-panel"
    )
    .classList
    .add("hidden");



    renderCollection();


    currentPlant = null;

}



// ==========================================
// 📸 13. 카메라
// ==========================================

function openCamera() {


    document.getElementById(
        "camera-input"
    ).click();

}



// ==========================================
// 📷 14. 사진 찍은 후
// ==========================================

document.getElementById(
    "camera-input"
)
.addEventListener(

    "change",

    function(event) {


        const file =
            event.target.files[0];


        if (
            !file
        ) {

            return;

        }



        alert(

            "📸 사진을 찍었습니다!\n\n" +

            "현재 버전에서는 사진을 식물 판별에 사용하지 않습니다.\n" +

            "다음 단계에서 AI 식물 판별 기능을 연결할 수 있습니다."

        );

    }

);



// ==========================================
// ❌ 15. GPS 오류
// ==========================================

function locationError(
    error
) {


    console.error(
        error
    );


    if (
        error.code === 1
    ) {


        alert(
            "📍 위치 권한이 거부되었습니다.\n브라우저에서 위치 권한을 허용해주세요."
        );

    }


    else if (
        error.code === 2
    ) {


        alert(
            "📍 현재 위치를 확인할 수 없습니다."
        );

    }


    else if (
        error.code === 3
    ) {


        alert(
            "📍 위치 확인 시간이 초과되었습니다."
        );

    }

}



// ==========================================
// 📖 16. 식물 상세 모달
// ==========================================

function openPlantModal(
    plant
) {


    document.getElementById(
        "modal-image"
    ).src = plant.image;


    document.getElementById(
        "modal-image"
    ).alt = plant.name;


    document.getElementById(
        "modal-name"
    ).textContent =
        plant.name;


    document.getElementById(
        "modal-description"
    ).textContent =
        plant.description;


    document.getElementById(
        "modal-discovery"
    ).textContent =
        "🌱 발견 완료";


    document.getElementById(
        "plant-modal"
    )
    .classList
    .remove("hidden");

}



// ==========================================
// ❌ 17. 모달 닫기
// ==========================================

function closePlantModal() {


    document.getElementById(
        "plant-modal"
    )
    .classList
    .add("hidden");

}



// ==========================================
// 🚀 18. 처음 실행
// ==========================================

renderCollection();
