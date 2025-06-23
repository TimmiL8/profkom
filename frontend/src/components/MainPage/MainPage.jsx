import photo from "../../assets/gallery.png"
import {useEffect, useState} from "react";

export default function MainPage() {
    const [articles, setArticles] = useState([""])

    useEffect(() => {
        setArticles([
            <>
                <img src={photo} alt=""/>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi aperiam atque culpa cumque doloremque
                    nihil non optio sint soluta totam. Alias aut culpa esse eum optio soluta voluptatem. Aspernatur,
                    in?
                </p>
            </>,
            <>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium consequuntur deserunt
                    dolore eligendi, iusto pariatur perspiciatis placeat sed, totam vero voluptatem? Aliquid inventore,
                    iste magnam nemo nesciunt praesentium sed?
                </p>
                <img src={photo} alt=""/>
            </>,
            <>
                <img src={photo} alt=""/>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium consequuntur deserunt
                    dolore eligendi, iusto pariatur perspiciatis placeat sed, totam vero voluptatem? Aliquid inventore,
                    iste magnam nemo nesciunt praesentium sed?
                </p>
            </>,<>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium consequuntur deserunt
                    dolore eligendi, iusto pariatur perspiciatis placeat sed, totam vero voluptatem? Aliquid inventore,
                    iste magnam nemo nesciunt praesentium sed?
                </p>
                <img src={photo} alt=""/>
            </>,
            <>
                <img src={photo} alt=""/>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium consequuntur deserunt
                    dolore eligendi, iusto pariatur perspiciatis placeat sed, totam vero voluptatem? Aliquid inventore,
                    iste magnam nemo nesciunt praesentium sed?
                </p>
            </>,

        ]);
    }, []);

    return (
        <>
            {articles.map((article, index) => (
                index % 2 === 0 ? <article className="article even">{article}</article> :
                    <article className="article odd">{article}</article>
            ))}


        </>
    );
}