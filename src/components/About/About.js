import PageWrapper from "../PageWrapper";
import { fetchPage } from "../../utils/pageUtils";
import { useEffect, useState } from "react";

const About = () => {
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAbout = async () => {
      const response = await fetchPage();
      response.error ? setError(response.content) : setPage(response.content);
    };
    fetchAbout();
  }, []);

  return <PageWrapper title={page?.title?.rendered}>About Page</PageWrapper>;
};

export default About;
