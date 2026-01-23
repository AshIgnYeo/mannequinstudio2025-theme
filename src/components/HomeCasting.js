import { BsArrowRight } from "react-icons/bs";

const HomeCasting = () => {
  return (
    <div className="h-screen flex items-center justify-center relative">
      <div className="w-1/5"></div>
      <div className="w-2/5 group cursor-pointer">
        <h2 className="text-7xl my-5 flex items-center justify-between">
          Casting
          <BsArrowRight className="-translate-x-20 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
        </h2>
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Explicabo
          numquam earum velit aliquam molestiae dolores ipsum illo? Suscipit
          mollitia tempore blanditiis expedita corporis perferendis repellendus
          incidunt corrupti et sint. Esse? Doloremque, et. Suscipit autem
          eveniet qui ipsum, rem repudiandae repellat, expedita quia ullam
          excepturi repellendus ipsam harum illo eos mollitia doloremque
          voluptatibus! Ea, eius! Dolor perferendis quas similique consequuntur
          mollitia. Amet, sed commodi sit reiciendis possimus vel, fugit in
          cupiditate error assumenda reprehenderit ipsum. Pariatur tenetur sunt
          minima labore voluptas inventore et, culpa nobis quia aperiam!
        </p>
        <p>
          Vero reiciendis corrupti nostrum? Porro quos similique hic, voluptatem
          a aspernatur voluptatibus. Fuga distinctio error ducimus quod porro
          voluptatum. Explicabo quia natus accusantium ducimus libero, accusamus
          quo quae, suscipit voluptas ratione nostrum obcaecati excepturi! Quam
          beatae laborum, rem asperiores, in laboriosam quisquam perferendis
          quos a rerum porro voluptatem aperiam velit et maxime similique,
          corporis quidem adipisci alias ratione nihil numquam!
        </p>
      </div>
    </div>
  );
};

export default HomeCasting;
