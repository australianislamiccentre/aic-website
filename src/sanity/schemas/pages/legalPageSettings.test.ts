import { describe, it, expect, vi } from "vitest";
import privacyPageSettings from "./privacyPageSettings";
import termsPageSettings from "./termsPageSettings";

type HrefField = { name: string; validation?: (rule: { uri: (options: unknown) => unknown }) => unknown };
type PageSchema = { fields: Array<{ name: string }> };

function linkHrefField(schema: PageSchema): HrefField | undefined {
  const content = schema.fields.find((field) => field.name === "content") as unknown as {
    of: Array<{ marks: { annotations: Array<{ name: string; fields: HrefField[] }> } }>;
  };
  const link = content.of[0].marks.annotations.find((annotation) => annotation.name === "link");
  return link?.fields.find((field) => field.name === "href");
}

describe.each<[string, PageSchema]>([
  ["Privacy Policy", privacyPageSettings],
  ["Terms of Use", termsPageSettings],
])("%s page content links", (_page, schema) => {
  it("accept mailto: and tel: links (regression: the existing mailto link blocked publishing)", () => {
    const href = linkHrefField(schema);
    expect(href?.validation).toBeTypeOf("function");

    const uri = vi.fn().mockReturnValue({});
    href?.validation?.({ uri });

    expect(uri).toHaveBeenCalledWith(
      expect.objectContaining({ scheme: expect.arrayContaining(["http", "https", "mailto", "tel"]) }),
    );
  });
});
