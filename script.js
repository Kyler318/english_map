// script.js (高德地圖版本 - 固定視窗與語音控制)

// 城市坐標和景點名稱數據 - 已包含圖片路徑
const locations = [
    { city: '香港', lat: 22.302711, lng: 114.177216, name_en: 'The Peak', info: 'The Peak (太平山頂)', image_path:'太平山頂.jpg' },
    { city: '上海', lat: 31.2286, lng: 121.4747, name_en: 'The Bund', info: 'The Bund (上海外灘)', image_path:'上海外灘.jpg' },
    { city: '北京', lat: 39.9067, lng: 116.3975, name_en: 'The Great Wall', info: 'The Great Wall (長城)', image_path:'長城.jpg' },
    { city: '西安', lat: 34.2611, lng: 108.9422, name_en: 'The Terracotta Army', info: 'The Terracotta Army (兵馬俑)', image_path:'兵馬俑.jpg' },
    { city: '澳門', lat: 22.1987, lng: 113.5439, name_en: 'The Ruins of St. Paul', info: 'The Ruins of St. Paul (大三巴)', image_path:'大三巴.jpg' },
];

const AMAP_STYLE = 'amap://styles/blue'; 

// 初始化地圖的函式 (高德地圖 API 調用此函式)
function initMap() {
    const chinaCenter = [104.1954, 35.8617]; 
    const mapContainer = document.getElementById('map');
    
    if (typeof AMap === 'undefined') {
        console.error("高德地圖 AMap 物件未載入，請檢查您的 Key 和網絡。");
        return;
    }

    const map = new AMap.Map(mapContainer, {
        zoom: 4, 
        center: chinaCenter,
        mapStyle: AMAP_STYLE, 
    });
    
    // ⚠️ 移除 AMap.InfoWindow 的初始化
    // const infoWindow = new AMap.InfoWindow({ ... }); 

    // 獲取自定義視窗的 DOM 元素
    const fixedInfoWindow = document.getElementById('fixed-info-wrapper');
    const infoContentContainer = document.getElementById('info-content-container');

    // 為每個地點添加紅色圓點標記
    locations.forEach(location => {
        const markerPosition = [location.lng, location.lat]; 
        
        const markerContent = `
            <div style="
                width: 16px;
                height: 16px;
                background-color: #FF0000; 
                border-radius: 50%;
                border: 2px solid #FFFFFF; 
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
            "></div>
        `;

        const marker = new AMap.Marker({
            position: markerPosition,
            map: map,
            title: location.city,
            content: markerContent, 
            anchor: 'center' 
        });

        // 監聽點擊事件
        marker.on('click', () => {
            // 1. 構建並顯示固定視窗
            const contentHTML = `
                <h3>${location.city}</h3>
                <p><strong>英文名稱:</strong> ${location.name_en}</p>
                <img src="${location.image_path}" alt="${location.city}景點">
            `;
            
            // 替換內容，並保留關閉按鈕
            infoContentContainer.innerHTML = contentHTML + '<button id="close-btn" onclick="closeFixedInfoWindow()">×</button>';
            fixedInfoWindow.style.display = 'flex'; // 顯示視窗

            // 2. 讀出景點名稱三次，每次間隔 2 秒
            speakName(location.name_en, 3, 1000);
        });
    });
}

/**
 * 關閉固定資訊視窗，並停止語音播報
 */
function closeFixedInfoWindow() {
    // 隱藏視窗
    document.getElementById('fixed-info-wrapper').style.display = 'none';
    
    // 停止語音播報
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

/**
 * 讀出景點名稱多次，每次間隔指定的毫秒數。
 */
function speakName(text, count, interval) {
    if (!('speechSynthesis' in window)) {
        console.warn('您的瀏覽器不支援 Speech Synthesis API.');
        return;
    }
    
    // 如果有正在播報的語音，先停止
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; 

    let repeatCount = 0;

    const read = () => {
        // 在開始新的播報前，檢查是否被 cancel() 停止
        if (repeatCount < count) {
            window.speechSynthesis.speak(utterance);
            repeatCount++;
            if (repeatCount < count) {
                // 等待語音結束後再設置 setTimeout，避免語音重疊
                utterance.onend = () => {
                    setTimeout(read, interval);
                };
            }
        }
    };
    
    // 開始讀出
    read();
}