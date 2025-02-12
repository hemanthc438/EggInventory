const getDeviceBrand = () => {
    const userAgent = navigator.userAgent;

    if (/Macintosh|Mac OS X/i.test(userAgent)) return "Mac";
    if (/Windows NT/i.test(userAgent)) return "Windows";
    if (/Linux/i.test(userAgent) && !/Android/i.test(userAgent)) return "Linux";
    if (/Samsung|SM-|SAMSUNG/i.test(userAgent)) return "Samsung";
    if (/iPhone|iPad|iPod/i.test(userAgent)) return "Apple";
    if (/Huawei|Honor/i.test(userAgent)) return "Huawei";
    if (/Xiaomi|Mi|Redmi/i.test(userAgent)) return "Xiaomi";
    if (/OnePlus/i.test(userAgent)) return "OnePlus";
    if (/Oppo/i.test(userAgent)) return "Oppo";
    if (/Vivo/i.test(userAgent)) return "Vivo";
    if (/Realme/i.test(userAgent)) return "Realme";
    if (/Pixel/i.test(userAgent)) return "Google Pixel";
    if (/Motorola|Moto/i.test(userAgent)) return "Motorola";
    if (/Nokia/i.test(userAgent)) return "Nokia";
    if (/Sony/i.test(userAgent)) return "Sony";
    if (/LG/i.test(userAgent)) return "LG";
    
    return "Unknown Device";
};
export const getExchangeId = (id1,id2) =>{
    const sortedId = [id1,id2].sort()
    return sortedId.join('-')
}
export const dateFormat = (date) =>{
    return date?date.toDate().toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        })
        : "No Date Available"
    }

export default getDeviceBrand