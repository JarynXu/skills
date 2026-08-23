> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/data-access/jdbc.adoc`  
> Upstream Git blob: `069e6a7849d84aecd7cd6477ad0266c0cce28165`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[jdbc]]
# Data Access with JDBC

The value provided by the Spring Framework JDBC abstraction is perhaps best shown by
the sequence of actions outlined in the following table below. The table shows which actions Spring
takes care of and which actions are your responsibility.

[[jdbc-who-does-what]]
.Spring JDBC - who does what?
|===
| Action| Spring| You

| Define connection parameters.
|
| X

| Open the connection.
| X
|

| Specify the SQL statement.
|
| X

| Declare parameters and provide parameter values
|
| X

| Prepare and run the statement.
| X
|

| Set up the loop to iterate through the results (if any).
| X
|

| Do the work for each iteration.
|
| X

| Process any exception.
| X
|

| Handle transactions.
| X
|

| Close the connection, the statement, and the resultset.
| X
|
|===

The Spring Framework takes care of all the low-level details that can make JDBC such a
tedious API.
