import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageWrapper from "./PageWrapper";
import { fetchPage } from "../utils/pageUtils";

const Page = () => {
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      const result = await fetchPage();

      if (result.error) {
        setError(result.content);
        setPage(null);
      } else {
        setPage(result.content);
        setError(null);
      }

      setIsLoading(false);
    };

    loadPage();
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          className="h-screen flex w-full items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        ></motion.div>
      ) : (
        <PageWrapper title={page?.title?.rendered}>
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-8 md:mt-16">
              {/* Left Column - Main Content */}
              <div className="max-w-3xl">
                <div
                  className="wp-content text-primary text-base md:text-lg leading-relaxed space-y-6
                    [&>h2]:text-2xl [&>h2]:md:text-3xl [&>h2]:font-semibold [&>h2]:mt-12 [&>h2]:mb-4
                    [&>h3]:text-xl [&>h3]:md:text-2xl [&>h3]:font-semibold [&>h3]:mt-10 [&>h3]:mb-3
                    [&>h4]:text-lg [&>h4]:md:text-xl [&>h4]:font-semibold [&>h4]:mt-8 [&>h4]:mb-2
                    [&>p]:mb-6 [&>p]:text-primary/80
                    [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2
                    [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2
                    [&>blockquote]:border-l-4 [&>blockquote]:border-primary/30 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:my-8"
                  dangerouslySetInnerHTML={{ __html: page?.content?.rendered }}
                />
              </div>

              {/* Right Column - Placeholder for future content */}
              <div className="hidden lg:block">
                {/* Future content will go here */}
              </div>
            </div>
          )}
        </PageWrapper>
      )}
    </AnimatePresence>
  );
};

export default Page;
