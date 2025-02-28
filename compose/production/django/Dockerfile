
# define an alias for the specific python version used in this file.
FROM docker.io/python:3.13.2-slim-bookworm AS python

# Python build stage
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS python-build-stage
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

ARG APP_HOME=/app

WORKDIR ${APP_HOME}

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

COPY . ${APP_HOME}

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# Install apt packages
RUN apt-get update && apt-get install --no-install-recommends -y \
  # dependencies for building Python packages
  build-essential \
  # psycopg dependencies
  libpq-dev


# Requirements are installed here to ensure they will be cached.
COPY ./requirements .

# Create Python Dependency and Sub-Dependency Wheels.
RUN pip wheel --wheel-dir /usr/src/app/wheels  \
  -r ${BUILD_ENVIRONMENT}.txt


# Python 'run' stage
FROM docker.io/python:3.13.2-slim-bookworm AS python-run-stage

ARG APP_HOME=/app

WORKDIR ${APP_HOME}

RUN addgroup --system django \
  && adduser --system --ingroup django django


# Install required system dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
  # psycopg dependencies
  libpq-dev \
  # Translations dependencies
  gettext \
  # entrypoint
  wait-for-it \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*


COPY --chown=django:django ./compose/production/django/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint


COPY --chown=django:django ./compose/production/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

# Copy the application from the builder
COPY --from=python-build-stage --chown=django:django ${APP_HOME} ${APP_HOME}

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

USER django

RUN DATABASE_URL="" \
  DJANGO_SETTINGS_MODULE="config.settings.test" \
  python manage.py compilemessages

ENTRYPOINT ["/entrypoint"]
