import photo from "../../assets/group_photo.png"

export default function MainPage() {


    return (
        <>
            <article className="article ">
                <div>
                    <h1 className="text-6xl mb-8 mt-6">ПРО НАС</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi aperiam atque culpa cumque
                        doloremque
                        nihil non optio sint soluta totam. Alias aut culpa esse eum optio soluta voluptatem. Aspernatur,
                        in?
                    </p>
                </div>
                <img src={photo} alt=""/>
            </article>

        </>
    );
}