module Excerpt
  def excerpt(input)
    if input.include? "<!--more-->"
      input.split("<!--more-->").first
    else
      input
    end
  end

end

class ExcerptTag < Liquid::Tag
  def render context
    "<!--more-->"
  end
end

Liquid::Template.register_tag 'end_excerpt', ExcerptTag
Liquid::Template.register_filter(Excerpt)
