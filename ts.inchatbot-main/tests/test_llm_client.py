from types import SimpleNamespace

from app.generation.llm_client import LLMClient


def test_llm_client_uses_supported_groq_model():
    client = LLMClient()
    assert client.provider == "groq"
    assert client.model not in {"groq/compound", ""}
    assert client.model in {"openai/gpt-oss-20b", "openai/gpt-oss-120b"}


def test_generate_stream_handles_empty_choice_chunks():
    client = LLMClient()

    class DummyChunk:
        def __init__(self, content):
            self.choices = [SimpleNamespace(delta=SimpleNamespace(content=content))]

    class DummyStream:
        def __iter__(self):
            yield DummyChunk("Hi")
            yield SimpleNamespace(choices=[])
            yield DummyChunk(" there")

    client.client = SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=lambda **kwargs: DummyStream())))

    output = "".join(client.generate_stream("hello", "system"))
    assert output == "Hi there"
