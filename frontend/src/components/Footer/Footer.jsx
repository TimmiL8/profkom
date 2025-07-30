import telegramLogo from "../../assets/icons/telegram-icon.svg"
import instagramLogo from "../../assets/icons/instagram-icon.svg"

export default function Footer() {
    return (
        <footer className="flex flex-col gap-y-2 mb-5 items-center">
            <hr className="w-full border-t-2 border-black mb-2"/>
            <div className="flex flex-row gap-4">
                <img src={telegramLogo} alt="telegram icon"/>
                <img src={instagramLogo} alt="instagram icon"/>
            </div>
            <p>@student_union_ifntuog</p>
            <p>+380 (00) 000 00 00</p>
            <p>м. Івано-Франківськ, Карпатська, (ауд. 0315)</p>
        </footer>
    )
}