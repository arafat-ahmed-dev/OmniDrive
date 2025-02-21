import React from "react";
import Sort from "@/components/Sort";
import { getFiles } from "@/lib/action/file.action";
import { Models } from "node-appwrite";
import Card from "@/components/Card";
import { formatBytes, getFileTypesParams } from "@/lib/utils";
import { redirect } from "next/navigation";
import PaginationComponent from "@/components/Pagination";

interface SearchParamProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
  params: Promise<{ [key: string]: string | undefined }>;
}

const Page = async ({ searchParams, params }: SearchParamProps) => {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;

  const type = resolvedParams?.type || "documents"; // Default to 'documents' if no type is provided
  const searchText = resolvedSearchParams?.query || "";
  const pageNumber = resolvedSearchParams?.page
    ? parseInt(resolvedSearchParams.page, 10)
    : 1;
  const sort = resolvedSearchParams?.sort || "";
  const types = getFileTypesParams(type); // Fetch only the allowed types

  // If types is null, the type is invalid, so we redirect
  if (types === null) {
    redirect("/"); // Redirect if the type is invalid
  }

  const limit = 15;
  const offset = (pageNumber - 1) * limit; // Calculate the offset based on the page number

  // Fetch files from the server
  const files = await getFiles({ types, searchText, sort, limit, offset });

  // Handle case where files are not fetched
  if (!files || !files.documents) {
    return <p className="empty-list">Failed to fetch files</p>;
  }

  const totalCount = files.total;
  let totalSize = 0;

  // Calculate the total size of all files
  files.documents.forEach((item: Models.Document) => {
    totalSize += item.size;
  });

  const size = formatBytes(totalSize);

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">{size}</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>
            <Sort />
          </div>
        </div>
      </section>

      {/* Render the files */}
      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files uploaded</p>
      )}

      {/* Pagination */}
      <div className="absolute bottom-10 bg-white border-2 rounded-lg">
        <PaginationComponent totalCount={totalCount} itemsPerPage={limit} />
      </div>
    </div>
  );
};

export default Page;
