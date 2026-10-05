<?php

namespace App\Entity;

use App\Repository\PreciosRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PreciosRepository::class)]
class Precios
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Productos::class, inversedBy: 'precios')]
    #[ORM\JoinColumn(nullable: false)]
    private Productos $producto;

    #[ORM\ManyToOne(targetEntity: Supermercados::class, inversedBy: 'precios')]
    #[ORM\JoinColumn(nullable: false)]
    private Supermercados $supermercado;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private ?string $precio = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProducto(): ?Productos
    {
        return $this->producto;
    }

    public function setProducto(Productos $producto): static
    {
        $this->producto = $producto;

        return $this;
    }

    public function getSupermercado(): ?Supermercados
    {
        return $this->supermercado;
    }

    public function setSupermercado(Supermercados $supermercado): static
    {
        $this->supermercado = $supermercado;

        return $this;
    }

    public function getPrecio(): ?string
    {
        return $this->precio;
    }

    public function setPrecio(string $precio): static
    {
        $this->precio = $precio;

     return $this;
    }
}
