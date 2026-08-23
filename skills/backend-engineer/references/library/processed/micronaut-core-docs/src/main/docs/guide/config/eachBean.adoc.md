> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/config/eachBean.adoc`  
> Upstream Git blob: `777cdddab8cb69a56c16642160fdf1d03cf308e9`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The [@EachProperty]({api}/io/micronaut/context/annotation/EachProperty.html) annotation is a great way to drive dynamic configuration, but typically you want to inject that configuration into another bean that depends on it. Injecting a single instance with a hard-coded qualifier is not a great solution, hence `@EachProperty` is typically used in combination with [@EachBean]({api}/io/micronaut/context/annotation/EachBean.html):

snippet::io.micronaut.docs.config.env.DataSourceFactory[tags="eachBean", indent=0, title="Using @EachBean"]

<1> The above example defines a bean [Factory]({api}/io/micronaut/context/annotation/Factory.html) that creates instances of `javax.sql.DataSource`.
<2> The [@EachBean]({api}/io/micronaut/context/annotation/EachBean.html) annotation indicates that a new `DataSource` bean will be created for each `DataSourceConfiguration` defined in the previous section.
<3> The `DataSourceConfiguration` instance is injected as a method argument and used to drive the configuration of each `javax.sql.DataSource`

NOTE: `@EachBean` requires that the parent bean has a `@Named` qualifier, since the qualifier is inherited by each bean created by `@EachBean`.

In other words, to retrieve the `DataSource` created by `test.datasource.one` you can do:

snippet::io.micronaut.docs.config.env.EachBeanTest[tags="beans", indent=0, title="Using a Qualifier"]

<1> We demonstrate here that there are indeed two data sources. How can we get one in particular?
<2> By using `Qualifiers.byName("one")`, we can select which of the two beans we'd like to reference.
