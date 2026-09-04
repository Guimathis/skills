---
name: api-conventions
description: REST API design, OpenAPI/Swagger documentation, input DTO and response conventions for this project. Use when creating or modifying controllers, endpoints, input requests, OpenAPI documentation or exception handling.
---

# API conventions

## Richardson maturity
Level 2: resource URIs + correct HTTP verbs + correct status codes.
Do NOT implement HATEOAS. No links in responses, no EntityModel,
no spring-hateoas dependency.

## URIs
- Plural nouns: `/resources`, `/resources/{id}`
- No verbs in the URI.

## Controller mapping & OpenAPI Documentation
The base URI of the resource is declared ONCE, in a class-level
`@RequestMapping`. Method annotations carry only the complement.
Never repeat the base URI in the methods.

Always document every controller, endpoint, parameter and DTO with SpringDoc / OpenAPI annotations:
- `@Tag` at the controller class level.
- `@Operation` (with `summary` and `description`) on every endpoint method.
- `@ApiResponses` / `@ApiResponse` covering success and expected error status codes (referencing `ProblemDetail.class` for errors).
- `@Parameter` on path variables and query params with clear `description` and `example`.
- `@io.swagger.v3.oas.annotations.parameters.RequestBody` on `@RequestBody` parameters.

```java
@RestController
@RequestMapping("/resources")
@RequiredArgsConstructor
@Tag(name = "Recursos", description = "Operações para gerenciamento de recursos")
public class ResourceController {

    private final ResourceService resourceService;

    @Operation(
            summary = "Listar todos os recursos",
            description = "Recupera a lista completa de recursos disponíveis no sistema."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista recuperada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ListAllResourcesResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping
    public ResponseEntity<ListAllResourcesResponseDto> getAllResources() {
        ListAllResourcesResponseDto response = resourceService.getAll();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(
            summary = "Obter um recurso por ID",
            description = "Busca os detalhes de um recurso específico pelo seu identificador único."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Recurso encontrado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OneResourceResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Recurso não encontrado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<OneResourceResponseDto> getOneResource(
            @Parameter(description = "Identificador único do recurso", required = true, example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
            @PathVariable(value = "id") UUID id) {
        OneResourceResponseDto response = resourceService.getById(id);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(
            summary = "Criar um novo recurso",
            description = "Cadastra um novo recurso no sistema a partir dos dados fornecidos."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Recurso criado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = SaveResourceResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados da requisição inválidos",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PostMapping
    public ResponseEntity<SaveResourceResponseDto> saveResource(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Payload com dados para criação do recurso",
                    required = true
            )
            @RequestBody @Valid SaveResourceRequestDto saveResourceRequestDto) {
        SaveResourceResponseDto response = resourceService.save(saveResourceRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

- Collection endpoints (list all, create) take a bare `@GetMapping` /
  `@PostMapping` with no path at all.
- Item endpoints take only `"/{id}"`.
- When the method annotation also needs another attribute, the path stops
  using the shortcut form and becomes explicit:
  `@GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)`.

## Verbs and status codes
| Action | Verb | Path | Success   |
|---|---|---|-----------|
| List all | GET | `/resources` | 200       |
| Get one | GET | `/resources/{id}` | 200 / 404 |
| Create | POST | `/resources` | 201       |
| Update | PUT | `/resources/{id}` | 200 / 404 |
| Delete | DELETE | `/resources/{id}` | 200 / 404 |
| Validation failure | — | — | 400       |

## Input DTOs
- Java requests, named `<Action><Name>RequestDto` or `<Name>RequestDto`.
- Carry Bean Validation annotations.
- Carry `@Schema` on class and all fields with `description`, `example`, and `allowableValues` (where applicable).

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados para cadastro de um novo recurso")
public class SaveResourceRequestDto implements Serializable {

    @NotBlank(message = "O nome é obrigatório")
    @Schema(description = "Nome do recurso", example = "Meu Recurso")
    private String name;
}
```

## Responses
- Java responses, named `<Action><Name>ResponseDto`.
- Carry `@Schema` on class and all fields with `description` and `example`.
- Never return `<Object>` or `<List<Object>>`.
- Never return `null`.
- Never return `Optional<T>`.
- Never return `ResponseEntity<Optional<T>>`.
- Never return `ResponseEntity<List<Optional<T>>`.
- Controllers return `ResponseEntity<T>` and set the status explicitly
  with `ResponseEntity.status(HttpStatus.X).body(...)`.
- Do not use try/catch in the controller.

