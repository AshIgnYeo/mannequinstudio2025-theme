import PageWrapper from "../PageWrapper";
import { fetchPage } from "../../utils/pageUtils";
import { useEffect, useState } from "react";

const About = () => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAbout = async () => {
      const response = await fetchPage("about");
      if (response.error) {
        setError(response.content);
      } else {
        setPage(response.content);
      }
      setLoading(false);
    };
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <PageWrapper title="About">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse text-secondary">Loading...</div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !page) {
    return (
      <PageWrapper title="About">
        <div className="text-center py-12">
          <p className="text-secondary">Unable to load page content.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={page.title?.rendered || "About"}>
      <div className="max-w-3xl mt-8 md:mt-16">
        <div
          className="wp-content text-primary text-base md:text-lg leading-relaxed space-y-6
            [&>h2]:text-2xl [&>h2]:md:text-3xl [&>h2]:font-semibold [&>h2]:mt-12 [&>h2]:mb-4
            [&>h3]:text-xl [&>h3]:md:text-2xl [&>h3]:font-semibold [&>h3]:mt-10 [&>h3]:mb-3
            [&>h4]:text-lg [&>h4]:md:text-xl [&>h4]:font-semibold [&>h4]:mt-8 [&>h4]:mb-2
            [&>p]:mb-6 [&>p]:text-primary/80
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2
            [&>blockquote]:border-l-4 [&>blockquote]:border-primary/30 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:my-8"
          dangerouslySetInnerHTML={{ __html: page.content?.rendered || "" }}
        />
      </div>
    </PageWrapper>
  );
};

export default About;
